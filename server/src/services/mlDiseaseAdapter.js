const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Read service base URL from PLANT_PIPELINE_URL
const getPipelineUrl = () => {
  const base = (process.env.PLANT_PIPELINE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
  return `${base}/predict`;
};

const ML_DISEASE_URL = getPipelineUrl();

/**
 * Sends leaf image to FastAPI Plant Disease Pipeline service.
 * Supports up to 60-second inference timeout for multi-stage CPU processing.
 */
const predictDisease = async (filePath) => {
  if (process.env.USE_MOCK_ML === 'true') {
    return getMockDiseasePrediction(filePath);
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));

  const response = await axios.post(ML_DISEASE_URL, formData, {
    headers: formData.getHeaders(),
    timeout: 60000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  });

  return response.data;
};

/**
 * Fallback disease predictions for mock/demo mode
 */
function getMockDiseasePrediction(filePath) {
  const samplePredictions = [
    {
      status: 'confident',
      stage: 'final',
      prediction: 'tomato___early_blight',
      confidence: 0.9421,
      message: 'Tomato - Early Blight: confident diagnosis.',
      disease_info: {
        characteristics: 'Dark brown spots with concentric rings appearing on older leaves.',
        precautions: 'Ensure good spacing between plants and practice crop rotation.',
        cure: 'Apply copper-based fungicides or mancozeb at the first sign of infection.',
        organic_remedy: 'Neem oil spray and removal of affected lower foliage.',
        advisory: 'Confirm diagnosis before chemical application.'
      }
    },
    {
      status: 'confident',
      stage: 'final',
      prediction: 'tomato___healthy',
      confidence: 0.9850,
      message: 'Tomato - Healthy: the leaf looks healthy.',
      disease_info: {
        characteristics: 'The tomato leaf appears healthy.',
        precautions: 'Keep monitoring regularly and avoid overhead watering.',
        cure: 'Not needed.',
        organic_remedy: 'Not needed.',
        advisory: 'Maintain good cultural practices.'
      }
    }
  ];

  const index = Math.floor(Math.random() * samplePredictions.length);
  return samplePredictions[index];
}

module.exports = { predictDisease, ML_DISEASE_URL };
