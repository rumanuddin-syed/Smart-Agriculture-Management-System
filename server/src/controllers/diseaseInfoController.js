const Disease = require('../models/Disease');

// Get list of all 38 verified disease classes in knowledge base
exports.getAllDiseases = async (req, res) => {
  try {
    const diseases = await Disease.find().sort({ class_id: 1 });
    res.json({ total: diseases.length, diseases });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch disease knowledge base.' });
  }
};

// Search or get specific disease advisory by class_name or class_id
exports.getDiseaseByName = async (req, res) => {
  try {
    const { className } = req.params;
    const disease = await Disease.findOne({ class_name: className });

    if (!disease) {
      return res.status(404).json({ message: `No verified advisory found for class '${className}'.` });
    }

    res.json({ disease });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving disease advisory detail.' });
  }
};
