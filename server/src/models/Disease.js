const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema(
  {
    class_id: {
      type: Number,
      required: true,
      unique: true
    },
    class_name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    crop_name: {
      type: String,
      required: true
    },
    disease_name: {
      type: String,
      required: true
    },
    is_healthy: {
      type: Boolean,
      default: false
    },
    treatment_guidance: {
      type: String,
      default: 'No chemical treatment guidance provided.'
    },
    organic_eco_management: {
      type: String,
      default: 'No organic management guidance provided.'
    },
    remedy_status: {
      type: String,
      default: 'verified'
    },
    source_name: {
      type: String,
      default: 'Agricultural Advisory Board'
    },
    source_url: {
      type: String,
      default: ''
    },
    source_note: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Disease', diseaseSchema);
