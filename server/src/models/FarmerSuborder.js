const mongoose = require('mongoose');

const suborderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
  imageSnapshot: { type: String, default: '' }
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const farmerSuborderSchema = new mongoose.Schema(
  {
    suborderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    parentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CheckoutOrder',
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
    items: [suborderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING_PAYMENT', 'PROOF_SUBMITTED', 'APPROVED_DEMO', 'REJECTED_PROOF', 'CANCELLED'],
      default: 'PENDING_PAYMENT',
      index: true
    },
    fulfilmentStatus: {
      type: String,
      enum: [
        'PLACED',
        'ACCEPTED',
        'PROCESSING',
        'READY_FOR_DISPATCH',
        'DISPATCHED',
        'DELIVERED',
        'REJECTED_BY_FARMER',
        'CANCELLED'
      ],
      default: 'PLACED',
      index: true
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    deliveryNote: {
      type: String,
      default: ''
    },
    statusHistory: [statusHistorySchema],
    isStockRestored: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FarmerSuborder', farmerSuborderSchema);

