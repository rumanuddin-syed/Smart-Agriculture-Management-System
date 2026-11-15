const CropRecommendation = require('../models/CropRecommendation');
const { predictCrop } = require('../services/mlCropAdapter');

// Submit soil test parameters for crop recommendation
exports.recommendCrop = async (req, res) => {
  try {
    const { N, P, K, temperature, humidity, ph, rainfall } = req.body;

    if (
      N === undefined ||
      P === undefined ||
      K === undefined ||
      temperature === undefined ||
      humidity === undefined ||
      ph === undefined ||
      rainfall === undefined
    ) {
      return res.status(400).json({ message: 'All soil and environmental parameters (N, P, K, temperature, humidity, pH, rainfall) are required.' });
    }

    const soilData = {
      N: Number(N),
      P: Number(P),
      K: Number(K),
      temperature: Number(temperature),
      humidity: Number(humidity),
      ph: Number(ph),
      rainfall: Number(rainfall)
    };

    // Call ML Adapter
    const mlResult = await predictCrop(soilData);

    // Save to user history if logged in
    let savedRecord = null;
    if (req.user && req.user.id) {
      savedRecord = await CropRecommendation.create({
        userId: req.user.id,
        input: soilData,
        recommendedCrop: mlResult.crop,
        confidence: mlResult.confidence || 0.95
      });
    }

    res.status(200).json({
      message: 'Crop recommendation calculated successfully!',
      recommendedCrop: mlResult.crop,
      confidence: mlResult.confidence || 0.95,
      recordId: savedRecord ? savedRecord._id : null,
      input: soilData
    });
  } catch (err) {
    console.error('Crop Recommendation Error:', err);
    res.status(500).json({ message: 'Error processing crop recommendation request.' });
  }
};

// Get crop recommendation history for logged-in user
exports.getCropHistory = async (req, res) => {
  try {
    const history = await CropRecommendation.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ history });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch crop recommendation history.' });
  }
};

// Delete a single crop recommendation record
exports.deleteCropHistoryById = async (req, res) => {
  try {
    const record = await CropRecommendation.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!record) {
      return res.status(404).json({ message: 'Crop recommendation record not found.' });
    }
    res.json({ message: 'Record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete crop recommendation record.' });
  }
};

// Clear all crop recommendation history for user
exports.clearCropHistory = async (req, res) => {
  try {
    await CropRecommendation.deleteMany({ userId: req.user.id });
    res.json({ message: 'All crop recommendation records cleared successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear crop history.' });
  }
};
