const CheckoutOrder = require('../models/CheckoutOrder');
const FarmerSuborder = require('../models/FarmerSuborder');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const PaymentProof = require('../models/PaymentProof');

// Checkout - Atomic Multi-Farmer Order Creation
exports.createCheckout = async (req, res) => {
  try {
    const { items, deliveryAddress, deliveryMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required for checkout.' });
    }

    if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.street) {
      return res.status(400).json({ message: 'Complete delivery address is required.' });
    }

    // Step 1: Group items by farmer ID
    const farmerGrouped = {};
    const productIds = items.map((i) => i.productId);

    // Fetch verified active products
    const dbProducts = await Product.find({ _id: { $in: productIds } });
    const productMap = {};
    dbProducts.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    // Validate availability and compile groups
    for (const item of items) {
      const prod = productMap[item.productId];
      if (!prod) {
        return res.status(400).json({ message: `Product ${item.name || item.productId} no longer exists.` });
      }
      if (prod.status !== 'active') {
        return res.status(400).json({ message: `Product '${prod.name}' is currently unavailable.` });
      }
      if (prod.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for '${prod.name}'. Requested: ${item.quantity}, Available: ${prod.stock}`
        });
      }

      const farmerIdStr = prod.farmerId.toString();
      if (!farmerGrouped[farmerIdStr]) {
        farmerGrouped[farmerIdStr] = [];
      }

      // Snapshot with verified backend price
      const verifiedSubtotal = prod.pricePerUnit * item.quantity;
      farmerGrouped[farmerIdStr].push({
        productId: prod._id,
        name: prod.name,
        price: prod.pricePerUnit,
        unit: prod.unit,
        quantity: Number(item.quantity),
        subtotal: verifiedSubtotal,
        imageSnapshot: prod.images && prod.images.length > 0 ? prod.images[0] : ''
      });
    }

    // Step 2: Atomic Stock Reservation
    const decrementedProducts = [];
    try {
      for (const item of items) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: Number(item.quantity) }, status: 'active' },
          { $inc: { stock: -Number(item.quantity) } },
          { new: true }
        );

        if (!updated) {
          throw new Error(`Stock conflict: '${item.name || 'product'}' was just ordered by another buyer.`);
        }

        // Auto mark sold_out if stock hits 0
        if (updated.stock === 0) {
          updated.status = 'sold_out';
          await updated.save();
        }

        decrementedProducts.push({ id: item.productId, qty: Number(item.quantity) });
      }
    } catch (concurrencyErr) {
      // Compensating rollback for any decremented stock
      for (const dec of decrementedProducts) {
        await Product.findByIdAndUpdate(dec.id, {
          $inc: { stock: dec.qty },
          $set: { status: 'active' }
        });
      }
      return res.status(409).json({ message: concurrencyErr.message });
    }

    // Step 3: Create Master Checkout & Farmer Suborders
    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    let grandTotal = 0;
    const suborderIds = [];

    // Temporary parent order creation
    const parentOrder = new CheckoutOrder({
      orderNumber,
      consumerId: req.user.id,
      deliveryAddress,
      deliveryMethod: deliveryMethod || 'delivery',
      grandTotal: 0,
      suborders: []
    });

    for (const [farmerId, subItems] of Object.entries(farmerGrouped)) {
      const suborderSubtotal = subItems.reduce((sum, it) => sum + it.subtotal, 0);
      grandTotal += suborderSubtotal;

      const suborderNumber = `SUB-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      const suborder = await FarmerSuborder.create({
        suborderNumber,
        parentOrderId: parentOrder._id,
        farmerId,
        consumerId: req.user.id,
        items: subItems,
        subtotal: suborderSubtotal,
        paymentStatus: 'PENDING_PAYMENT',
        fulfilmentStatus: 'PLACED',
        statusHistory: [
          {
            status: 'PLACED',
            note: 'Order placed by consumer awaiting payment proof upload.',
            changedBy: req.user.id
          }
        ]
      });

      suborderIds.push(suborder._id);

      // In-app Notification for the Farmer
      await Notification.create({
        userId: farmerId,
        title: 'New Produce Order Received!',
        message: `You have received order #${suborderNumber} (${subItems.length} items, ₹${suborderSubtotal}).`,
        type: 'order',
        link: '/farmer/orders'
      });
    }

    parentOrder.grandTotal = grandTotal;
    parentOrder.suborders = suborderIds;
    await parentOrder.save();

    // In-app notification for the Consumer
    await Notification.create({
      userId: req.user.id,
      title: 'Order Placed Successfully!',
      message: `Checkout #${orderNumber} for ₹${grandTotal} placed. Please submit demo payment screenshot.`,
      type: 'order',
      link: `/consumer/orders`
    });

    res.status(201).json({
      message: 'Checkout successful! Suborders created for each respective farmer.',
      checkoutId: parentOrder._id,
      orderNumber,
      grandTotal,
      subordersCount: suborderIds.length
    });
  } catch (err) {
    console.error('createCheckout error:', err);
    res.status(500).json({ message: err.message || 'Error processing checkout.' });
  }
};

// Get Consumer Orders
exports.getConsumerOrders = async (req, res) => {
  try {
    const checkouts = await CheckoutOrder.find({ consumerId: req.user.id })
      .populate({
        path: 'suborders',
        populate: [
          { path: 'farmerId', select: 'name phone email' },
          { path: 'items.productId', select: 'name images unit' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({ orders: checkouts });
  } catch (err) {
    console.error('getConsumerOrders error:', err);
    res.status(500).json({ message: 'Error retrieving consumer orders.' });
  }
};

// Get Consumer Single Order Detail
exports.getConsumerOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;
    const checkout = await CheckoutOrder.findOne({ _id: orderId, consumerId: req.user.id }).populate({
      path: 'suborders',
      populate: [
        { path: 'farmerId', select: 'name phone email location' },
        { path: 'items.productId', select: 'name images unit' }
      ]
    });

    if (!checkout) {
      return res.status(404).json({ message: 'Order not found or unauthorized.' });
    }

    // Attach payment proofs for each suborder
    const suborderIds = checkout.suborders.map((s) => s._id);
    const proofs = await PaymentProof.find({ suborderId: { $in: suborderIds } }).sort({ createdAt: -1 });
    const proofMap = {};
    proofs.forEach((p) => {
      proofMap[p.suborderId.toString()] = p;
    });

    const enrichedSuborders = checkout.suborders.map((s) => ({
      ...s.toObject(),
      paymentProof: proofMap[s._id.toString()] || null
    }));

    res.json({
      checkout: {
        ...checkout.toObject(),
        suborders: enrichedSuborders
      }
    });
  } catch (err) {
    console.error('getConsumerOrderDetail error:', err);
    res.status(500).json({ message: 'Error fetching order details.' });
  }
};

// Consumer Cancel Suborder
exports.cancelConsumerSuborder = async (req, res) => {
  try {
    const { suborderId } = req.params;
    const { reason } = req.body;

    const suborder = await FarmerSuborder.findOne({ _id: suborderId, consumerId: req.user.id });
    if (!suborder) {
      return res.status(404).json({ message: 'Suborder not found or unauthorized.' });
    }

    if (['DISPATCHED', 'DELIVERED', 'CANCELLED', 'REJECTED_BY_FARMER'].includes(suborder.fulfilmentStatus)) {
      return res.status(400).json({
        message: `Cannot cancel suborder in '${suborder.fulfilmentStatus}' state.`
      });
    }

    suborder.fulfilmentStatus = 'CANCELLED';
    suborder.paymentStatus = 'CANCELLED';
    suborder.rejectionReason = reason || 'Cancelled by consumer before dispatch.';
    suborder.statusHistory.push({
      status: 'CANCELLED',
      note: reason || 'Cancelled by consumer.',
      changedBy: req.user.id
    });

    // Idempotent Stock Restoration
    if (!suborder.isStockRestored) {
      for (const item of suborder.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
          $set: { status: 'active' }
        });
      }
      suborder.isStockRestored = true;
    }

    await suborder.save();

    // Notify the farmer
    await Notification.create({
      userId: suborder.farmerId,
      title: 'Suborder Cancelled',
      message: `Suborder #${suborder.suborderNumber} was cancelled by consumer. Stock has been restored.`,
      type: 'order',
      link: '/farmer/orders'
    });

    res.json({ message: 'Suborder cancelled successfully and inventory restored.', suborder });
  } catch (err) {
    console.error('cancelConsumerSuborder error:', err);
    res.status(500).json({ message: 'Error cancelling suborder.' });
  }
};

