const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Disease = require('../models/Disease');
const connectDB = require('../config/db');

// Path to the verified disease CSV data
const csvFilePath = path.join(__dirname, '../../../data/phase1_disease_advisory_38_classes_verified_sources.csv');

// In case the file was placed in the root directory rather than /data
const altCsvFilePath = path.join(__dirname, '../../../phase1_disease_advisory_38_classes_verified_sources.csv');

async function importData() {
  await connectDB();

  console.log('🔄 Starting disease data import process...');

  const activeFilePath = fs.existsSync(csvFilePath) ? csvFilePath : (fs.existsSync(altCsvFilePath) ? altCsvFilePath : null);

  if (!activeFilePath) {
    console.error('❌ Could not find the phase1_disease_advisory_38_classes_verified_sources.csv file.');
    process.exit(1);
  }

  const results = [];

  fs.createReadStream(activeFilePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        let count = 0;
        
        for (const row of results) {
          // Map CSV columns to model fields
          // Note: Adjust the keys based on exact CSV header names if they differ slightly
          const diseaseData = {
            class_id: parseInt(row.class_id, 10),
            class_name: row.class_name,
            crop_name: row.crop_name,
            disease_name: row.disease_name,
            is_healthy: row.is_healthy === 'True' || row.is_healthy === 'true' || row.is_healthy === '1',
            treatment_guidance: row.treatment_guidance || 'No chemical treatment guidance provided.',
            organic_eco_management: row.organic_eco_management || 'No organic management guidance provided.',
            remedy_status: row.remedy_status || 'verified',
            source_name: row.source_name || 'Agricultural Advisory Board',
            source_url: row.source_url || '',
            source_note: row.source_note || ''
          };

          // Upsert data to avoid duplicates on re-run
          await Disease.findOneAndUpdate(
            { class_id: diseaseData.class_id },
            diseaseData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          count++;
        }

        console.log(`✅ Successfully imported/updated ${count} disease advisories into MongoDB!`);
        process.exit();
      } catch (err) {
        console.error('❌ Error saving disease data to MongoDB:', err);
        process.exit(1);
      }
    });
}

importData();
