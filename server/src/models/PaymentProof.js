const mongoose = require('mongoose');

const paymentProofSchema = new mongoose.Schema(
  {
    suborderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerSuborder',
      required: true,
      index: true
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    consumerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    screenshotUrl: {
      type: String,
      required: [true, 'Payment screenshot is required']
    },
    paymentReference: {
      type: String,
      default: '',
      trim: true
    },
    paymentMethod: {
      type: String,
      default: 'DEMO_UPI'
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'APPROVED_DEMO', 'REJECTED'],
      default: 'SUBMITTED',
      index: true
    },
    reviewNote: {
      type: String,
      default: ''
    },
    reviewedAt: {
      type: Date
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentProof', paymentProofSchema);

