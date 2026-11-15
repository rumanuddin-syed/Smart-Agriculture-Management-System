const FarmerSuborder = require('../models/FarmerSuborder');
const PaymentProof = require('../models/PaymentProof');
const Notification = require('../models/Notification');
const Product = require('../models/Product');

// Upload Simulated Payment Screenshot (Consumer)
exports.submitPaymentProof = async (req, res) => {
  try {
    const { suborderId, paymentReference, paymentMethod } = req.body;

    if (!suborderId) {
      return res.status(400).json({ message: 'Suborder ID is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Payment screenshot image file is required.' });
    }

    const suborder = await FarmerSuborder.findOne({ _id: suborderId, consumerId: req.user.id });
    if (!suborder) {
      return res.status(404).json({ message: 'Suborder not found or unauthorized.' });
    }

    if (['APPROVED_DEMO', 'CANCELLED', 'DELIVERED'].includes(suborder.paymentStatus)) {
      return res.status(400).json({ message: `Cannot submit payment proof for order in status: ${suborder.paymentStatus}` });
    }

    const screenshotUrl = `/uploads/payments/${req.file.filename}`;

    const proof = await PaymentProof.create({
      suborderId: suborder._id,
      farmerId: suborder.farmerId,
      consumerId: req.user.id,
      screenshotUrl,
      paymentReference: paymentReference || `UPI-${Date.now()}`,
      paymentMethod: paymentMethod || 'DEMO_UPI',
      status: 'SUBMITTED'
    });

    // Update Suborder State
    suborder.paymentStatus = 'PROOF_SUBMITTED';
    suborder.statusHistory.push({
      status: 'PROOF_SUBMITTED',
      note: `Payment proof submitted (Ref: ${proof.paymentReference}). Awaiting farmer review.`,
      changedBy: req.user.id
    });
    await suborder.save();

    // In-app Notification for Farmer
    await Notification.create({
      userId: suborder.farmerId,
      title: 'Payment Screenshot Received!',
      message: `Consumer submitted demo payment screenshot for suborder #${suborder.suborderNumber}. Please review.`,
      type: 'payment',
      link: '/farmer/orders'
    });

    res.status(201).json({
      message: 'Demo payment screenshot submitted successfully! The farmer will review it shortly.',
      proof,
      suborder
    });
  } catch (err) {
    console.error('submitPaymentProof error:', err);
    res.status(500).json({ message: err.message || 'Error submitting payment proof.' });
  }
};

// Farmer Reviews Payment Proof (Approve or Reject Demo Payment)
exports.reviewPaymentProof = async (req, res) => {
  try {
    const { proofId } = req.params;
    const { decision, reviewNote } = req.body; // decision: 'APPROVE' or 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(decision)) {
      return res.status(400).json({ message: "Decision must be either 'APPROVE' or 'REJECT'." });
    }

    const proof = await PaymentProof.findOne({ _id: proofId, farmerId: req.user.id });
    if (!proof) {
      return res.status(404).json({ message: 'Payment proof record not found or unauthorized.' });
    }

    const suborder = await FarmerSuborder.findById(proof.suborderId);
    if (!suborder) {
      return res.status(404).json({ message: 'Associated suborder not found.' });
    }

    if (decision === 'APPROVE') {
      proof.status = 'APPROVED_DEMO';
      proof.reviewNote = reviewNote || 'Payment screenshot verified for demonstration.';
      proof.reviewedAt = new Date();
      proof.reviewedBy = req.user.id;
      await proof.save();

      suborder.paymentStatus = 'APPROVED_DEMO';
      if (suborder.fulfilmentStatus === 'PLACED') {
        suborder.fulfilmentStatus = 'ACCEPTED';
      }
      suborder.statusHistory.push({
        status: 'APPROVED_DEMO',
        note: `Farmer approved demo payment screenshot. Order is accepted for preparation.`,
        changedBy: req.user.id
      });
      await suborder.save();

      // Notify Consumer
      await Notification.create({
        userId: suborder.consumerId,
        title: 'Demo Payment Approved!',
        message: `Farmer approved demo payment for suborder #${suborder.suborderNumber}. Preparation has begun.`,
        type: 'payment',
        link: `/consumer/orders`
      });

      return res.json({ message: 'Payment screenshot approved (Demo). Suborder status updated to ACCEPTED.', proof, suborder });
    } else {
      // REJECT
      proof.status = 'REJECTED';
      proof.reviewNote = reviewNote || 'Screenshot rejected: blurry or incorrect amount.';
      proof.reviewedAt = new Date();
      proof.reviewedBy = req.user.id;
      await proof.save();

      suborder.paymentStatus = 'REJECTED_PROOF';
      suborder.rejectionReason = proof.reviewNote;
      suborder.statusHistory.push({
        status: 'REJECTED_PROOF',
        note: `Payment proof rejected: ${proof.reviewNote}`,
        changedBy: req.user.id
      });
      await suborder.save();

      // Notify Consumer
      await Notification.create({
        userId: suborder.consumerId,
        title: 'Payment Screenshot Rejected',
        message: `Payment proof for #${suborder.suborderNumber} was rejected: "${proof.reviewNote}". Please upload a new proof.`,
        type: 'payment',
        link: `/consumer/orders`
      });

      return res.json({ message: 'Payment proof marked as rejected.', proof, suborder });
    }
  } catch (err) {
    console.error('reviewPaymentProof error:', err);
    res.status(500).json({ message: 'Error reviewing payment proof.' });
  }
};

// Farmer Order Fulfilment State Transitions
exports.updateSuborderFulfilment = async (req, res) => {
  try {
    const { suborderId } = req.params;
    const { status, note, deliveryNote } = req.body;

    const validTransitions = [
      'ACCEPTED',
      'PROCESSING',
      'READY_FOR_DISPATCH',
      'DISPATCHED',
      'DELIVERED',
      'REJECTED_BY_FARMER'
    ];

    if (!validTransitions.includes(status)) {
      return res.status(400).json({ message: `Invalid fulfillment status. Must be one of: ${validTransitions.join(', ')}` });
    }

    const suborder = await FarmerSuborder.findOne({ _id: suborderId, farmerId: req.user.id });
    if (!suborder) {
      return res.status(404).json({ message: 'Suborder not found or unauthorized.' });
    }

    // Safety rule: Dispatch cannot occur before demo payment proof is approved
    if (['DISPATCHED', 'DELIVERED'].includes(status) && suborder.paymentStatus !== 'APPROVED_DEMO') {
      return res.status(400).json({
        message: `Cannot dispatch or deliver order before demo payment proof has been approved. Current payment status: ${suborder.paymentStatus}`
      });
    }

    suborder.fulfilmentStatus = status;
    if (deliveryNote) suborder.deliveryNote = deliveryNote;
    if (status === 'REJECTED_BY_FARMER') {
      suborder.rejectionReason = note || 'Rejected by farmer due to unforeseen harvest conditions.';
      suborder.paymentStatus = 'CANCELLED';

      // Restore reserved inventory
      if (!suborder.isStockRestored) {
        for (const item of suborder.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity },
            $set: { status: 'active' }
          });
        }
        suborder.isStockRestored = true;
      }
    }

    suborder.statusHistory.push({
      status,
      note: note || `Order transitioned to ${status}.`,
      changedBy: req.user.id
    });

    await suborder.save();

    // Notify Consumer of dispatch or delivery
    await Notification.create({
      userId: suborder.consumerId,
      title: `Order Update: #${suborder.suborderNumber}`,
      message: `Your produce suborder is now: ${status.replace(/_/g, ' ')}. ${note ? `Note: ${note}` : ''}`,
      type: 'delivery',
      link: `/consumer/orders`
    });

    res.json({ message: `Suborder status updated to ${status}.`, suborder });
  } catch (err) {
    console.error('updateSuborderFulfilment error:', err);
    res.status(500).json({ message: 'Error updating suborder fulfilment status.' });
  }
};

// Farmer View Their Incoming Suborders
exports.getFarmerSuborders = async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    const filter = { farmerId: req.user.id };

    if (status) filter.fulfilmentStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const suborders = await FarmerSuborder.find(filter)
      .populate('consumerId', 'name phone email location')
      .populate('parentOrderId', 'deliveryAddress deliveryMethod orderNumber')
      .sort({ createdAt: -1 });

    const suborderIds = suborders.map((s) => s._id);
    const proofs = await PaymentProof.find({ suborderId: { $in: suborderIds } }).sort({ createdAt: -1 });
    const proofMap = {};
    proofs.forEach((p) => {
      // Store latest proof
      if (!proofMap[p.suborderId.toString()]) {
        proofMap[p.suborderId.toString()] = p;
      }
    });

    const enriched = suborders.map((s) => ({
      ...s.toObject(),
      latestPaymentProof: proofMap[s._id.toString()] || null
    }));

    res.json({ suborders: enriched });
  } catch (err) {
    console.error('getFarmerSuborders error:', err);
    res.status(500).json({ message: 'Error retrieving farmer suborders.' });
  }
};

