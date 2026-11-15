const mongoose = require('mongoose');

const checkoutOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    consumerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    deliveryAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, default: '' },
      state: { type: String, required: true },
      pincode: { type: String, required: true }
    },
    deliveryMethod: {
      type: String,
      enum: ['delivery', 'pickup'],
      default: 'delivery'
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0
    },
    suborders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FarmerSuborder'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('CheckoutOrder', checkoutOrderSchema);

