const mongoose = require('mongoose');

const farmerProfileSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    farmName: {
      type: String,
      required: [true, 'Please provide your farm name'],
      trim: true
    },
    farmDescription: {
      type: String,
      default: '',
      trim: true
    },
    village: {
      type: String,
      default: '',
      trim: true
    },
    district: {
      type: String,
      required: [true, 'Please provide your district'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'Please provide your state'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Please provide your PIN code'],
      trim: true
    },
    contactPhone: {
      type: String,
      default: ''
    },
    cropsCultivated: {
      type: [String],
      default: []
    },
    farmingMethod: {
      type: String,
      enum: ['organic', 'conventional', 'natural', 'mixed'],
      default: 'organic'
    },
    deliveryAreas: {
      type: [String],
      default: []
    },
    pickupAvailable: {
      type: Boolean,
      default: true
    },
    deliveryAvailable: {
      type: Boolean,
      default: true
    },
    profileImage: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FarmerProfile', farmerProfileSchema);

