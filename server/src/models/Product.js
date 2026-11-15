const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true
    },
    category: {
      type: String,
      enum: ['Vegetables', 'Fruits', 'Grains & Cereals', 'Pulses', 'Spices', 'Dairy', 'Other'],
      required: [true, 'Category is required'],
      index: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0.01, 'Price must be greater than zero']
    },
    unit: {
      type: String,
      enum: ['kg', 'gram', 'quintal', 'litre', 'piece', 'bundle'],
      default: 'kg'
    },
    stock: {
      type: Number,
      required: [true, 'Available stock is required'],
      min: [0, 'Stock cannot be negative'],
      index: true
    },
    minOrderQty: {
      type: Number,
      default: 1,
      min: [1, 'Minimum order quantity must be at least 1']
    },
    maxOrderQty: {
      type: Number,
      default: 1000
    },
    isOrganic: {
      type: Boolean,
      default: false,
      index: true
    },
    farmingMethod: {
      type: String,
      default: 'organic'
    },
    harvestDate: {
      type: Date
    },
    freshnessDuration: {
      type: String,
      default: '3-5 days'
    },
    location: {
      village: { type: String, default: '' },
      district: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' }
    },
    deliveryOptions: {
      pickup: { type: Boolean, default: true },
      localDelivery: { type: Boolean, default: true }
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'sold_out'],
      default: 'active',
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);

