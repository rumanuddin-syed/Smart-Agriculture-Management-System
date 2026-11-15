const Disease = require('../models/Disease');
const DiseasePrediction = require('../models/DiseasePrediction');
const { predictDisease } = require('../services/mlDiseaseAdapter');
const path = require('path');
const fs = require('fs');

// Helper to convert snake_case/___ label to pretty title
const formatLabel = (label) => {
  if (!label) return 'Unknown';
  return label
    .replace(/___/g, ' - ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// Submit uploaded leaf image for diagnosis
exports.detectDisease = async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a leaf image file.' });
    }

    filePath = req.file.path;

    // Read uploaded file and convert to Base64 Data URI for MongoDB persistence & rendering
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = req.file.mimetype || 'image/jpeg';
    const base64ImageUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    const imageUrl = base64ImageUrl;

    // 1. Call ML Model Adapter
    let mlResult;
    try {
      mlResult = await predictDisease(filePath);
    } catch (upstreamErr) {
      // Clean up temporary disk file
      try {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {}

      if (upstreamErr.response) {
        const status = upstreamErr.response.status;
        const detail = upstreamErr.response.data?.detail || 'Upstream ML service error';
        return res.status(status).json({ message: detail });
      }
      if (upstreamErr.code === 'ECONNABORTED' || upstreamErr.message?.includes('timeout')) {
        return res.status(504).json({ message: 'Inference request timed out. Please try again.' });
      }
      if (upstreamErr.code === 'ECONNREFUSED') {
        return res.status(503).json({ message: 'Plant disease ML pipeline service is currently unavailable.' });
      }
      return res.status(500).json({ message: 'Failed to communicate with plant pipeline service.' });
    }

    // Clean up temporary disk file immediately
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanErr) {
      console.warn('Temporary file cleanup warning:', cleanErr.message);
    }

    // Normalize pipeline status (defaulting gracefully if legacy service structure is encountered)
    const status = mlResult.status || (mlResult.prediction ? 'confident' : 'uncertain');
    const predictedClassName = mlResult.prediction || mlResult.candidate || null;
    const confidence = typeof mlResult.confidence === 'number' ? mlResult.confidence : (mlResult.disease?.confidence || null);

    // Build unified advisory structure from pipeline response or MongoDB fallback
    let advisory = null;
    let cropName = mlResult.crop?.name ? formatLabel(mlResult.crop.name) : 'Plant';
    let diseaseName = predictedClassName ? formatLabel(predictedClassName) : null;

    if (mlResult.disease_info) {
      advisory = {
        crop_name: cropName,
        disease_name: diseaseName,
        is_healthy: predictedClassName ? predictedClassName.includes('healthy') : false,
        treatment_guidance: mlResult.disease_info.cure || 'Consult local extension officer for chemical recommendations.',
        organic_eco_management: mlResult.disease_info.organic_remedy || 'N/A',
        precautions: mlResult.disease_info.precautions || 'N/A',
        characteristics: mlResult.disease_info.characteristics || 'N/A',
        advisory: mlResult.disease_info.advisory || 'Confirm diagnosis with local agricultural extension officer before treatment.',
        remedy_status: 'verified',
        source_name: 'Verified Agricultural Plant Pathology Knowledgebase'
      };
    } else if (predictedClassName) {
      // Fallback search in MongoDB Disease collection
      let advisoryDoc = await Disease.findOne({ class_name: predictedClassName });
      if (!advisoryDoc) {
        advisoryDoc = await Disease.findOne({
          class_name: { $regex: new RegExp(predictedClassName.replace(/_/g, '.*'), 'i') }
        });
      }
      if (advisoryDoc) {
        advisory = {
          class_id: advisoryDoc.class_id,
          class_name: advisoryDoc.class_name,
          crop_name: advisoryDoc.crop_name,
          disease_name: advisoryDoc.disease_name,
          is_healthy: advisoryDoc.is_healthy,
          treatment_guidance: advisoryDoc.treatment_guidance,
          organic_eco_management: advisoryDoc.organic_eco_management,
          remedy_status: advisoryDoc.remedy_status,
          source_name: advisoryDoc.source_name,
          source_url: advisoryDoc.source_url
        };
      }
    }

    // 2. Save to User History only if confident diagnosis and user logged in
    let savedRecord = null;
    if (req.user && req.user.id && status === 'confident' && predictedClassName) {
      savedRecord = await DiseasePrediction.create({
        userId: req.user.id,
        imageUrl,
        predictedClass: predictedClassName,
        cropName: advisory?.crop_name || cropName,
        diseaseName: advisory?.disease_name || diseaseName,
        confidence: confidence || 0.0,
        advisory: {
          treatment_guidance: advisory?.treatment_guidance || 'N/A',
          organic_eco_management: advisory?.organic_eco_management || 'N/A',
          remedy_status: advisory?.remedy_status || 'verified',
          source_name: advisory?.source_name || 'Plant Pipeline'
        }
      });
    }

    // 3. Respond with full pipeline fields preserved
    res.status(200).json({
      message: mlResult.message || 'Leaf image processed successfully.',
      status,
      stage: mlResult.stage || null,
      prediction: predictedClassName,
      confidence,
      imageUrl,
      advisory,
      disease_info: mlResult.disease_info || null,
      quality: mlResult.quality || null,
      detection: mlResult.detection || null,
      crop: mlResult.crop || null,
      health: mlResult.health || null,
      disease: mlResult.disease || null,
      ood: mlResult.ood || null,
      top_k: mlResult.top_k || null,
      reasons: mlResult.reasons || [],
      recordId: savedRecord ? savedRecord._id : null
    });
  } catch (err) {
    console.error('Disease Detection Controller Error:', err);
    try {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {}
    res.status(500).json({ message: 'Error processing leaf disease detection.' });
  }
};

// Get user disease prediction history
exports.getDiseaseHistory = async (req, res) => {
  try {
    const history = await DiseasePrediction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const sanitizedHistory = history.map((doc) => {
      const item = doc.toObject();
      if (!item.imageUrl || item.imageUrl.startsWith('/uploads/')) {
        item.imageUrl = '/assets/disease_banner.png';
      }
      return item;
    });
    res.json({ history: sanitizedHistory });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch disease prediction history.' });
  }
};

// Get single prediction result detail by ID
exports.getDiseaseHistoryById = async (req, res) => {
  try {
    const record = await DiseasePrediction.findOne({ _id: req.params.id, userId: req.user.id });
    if (!record) {
      return res.status(404).json({ message: 'Diagnosis record not found.' });
    }
    res.json({ record });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving diagnosis detail.' });
  }
};

// Delete a single disease diagnosis history record
exports.deleteDiseaseHistoryById = async (req, res) => {
  try {
    const record = await DiseasePrediction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!record) {
      return res.status(404).json({ message: 'Diagnosis record not found.' });
    }
    res.json({ message: 'Record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete diagnosis record.' });
  }
};

// Clear all disease diagnosis history for user
exports.clearDiseaseHistory = async (req, res) => {
  try {
    await DiseasePrediction.deleteMany({ userId: req.user.id });
    res.json({ message: 'All disease diagnosis records cleared successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear disease history.' });
  }
};
