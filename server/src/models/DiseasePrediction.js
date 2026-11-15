const mongoose = require('mongoose');

const diseasePredictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    predictedClass: {
      type: String,
      required: true
    },
    cropName: {
      type: String,
      default: 'Unknown Crop'
    },
    diseaseName: {
      type: String,
      default: 'Unknown Condition'
    },
    confidence: {
      type: Number,
      default: 0.90
    },
    advisory: {
      treatment_guidance: String,
      organic_eco_management: String,
      remedy_status: String,
      source_name: String,
      source_url: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DiseasePrediction', diseasePredictionSchema);
