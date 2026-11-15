const { getNearbyAgriStores } = require('../services/placesService');

// Get nearby agricultural stores, seed/fertilizer vendors, & KVK centers
exports.getNearbyServices = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 20.5937;
    const lng = parseFloat(req.query.lng) || 78.9629;
    const radius = parseFloat(req.query.radius) || 25;

    const stores = await getNearbyAgriStores(lat, lng, radius);

    res.json({
      userLocation: { lat, lng },
      radiusKm: radius,
      totalFound: stores.length,
      stores
    });
  } catch (err) {
    console.error('Nearby Controller Error:', err);
    res.status(500).json({ message: 'Error retrieving nearby agricultural services.' });
  }
};
