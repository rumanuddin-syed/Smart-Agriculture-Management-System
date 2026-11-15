const axios = require('axios');

const ML_CROP_URL = process.env.ML_CROP_API_URL || 'http://127.0.0.1:5001/predict';

/**
 * Sends soil parameters to Crop Recommendation Python ML Service.
 * Fallback to intelligent mock prediction if Python service is offline/initializing.
 */
const predictCrop = async (soilData) => {
  if (process.env.USE_MOCK_ML === 'true') {
    return getMockCropRecommendation(soilData);
  }

  try {
    const response = await axios.post(ML_CROP_URL, soilData, { timeout: 3000 });
    return response.data;
  } catch (error) {
    console.log(`⚠️ ML Crop Service unavailable (${error.message}). Using fallback prediction algorithm.`);
    return getMockCropRecommendation(soilData);
  }
};

/**
 * Simple agronomic fallback algorithm based on NPK & rainfall values
 */
function getMockCropRecommendation(soilData) {
  const { N, P, K, temperature, rainfall, ph } = soilData;

  let crop = 'rice';
  let confidence = 0.94;

  if (rainfall > 200) {
    crop = 'rice';
  } else if (N > 80 && P > 40 && K > 40) {
    crop = 'maize';
  } else if (ph < 6.0) {
    crop = 'tea';
  } else if (temperature > 30 && rainfall < 100) {
    crop = 'cotton';
  } else if (P > 60 && K > 50) {
    crop = 'chickpea';
  } else if (N > 50) {
    crop = 'wheat';
  } else {
    crop = 'pomegranate';
  }

  return { crop, confidence };
}

module.exports = { predictCrop };
