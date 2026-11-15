const mongoose = require('mongoose');

const cropRecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    input: {
      N: { type: Number, required: true },
      P: { type: Number, required: true },
      K: { type: Number, required: true },
      temperature: { type: Number, required: true },
      humidity: { type: Number, required: true },
      ph: { type: Number, required: true },
      rainfall: { type: Number, required: true }
    },
    recommendedCrop: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      default: 0.95
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CropRecommendation', cropRecommendationSchema);
