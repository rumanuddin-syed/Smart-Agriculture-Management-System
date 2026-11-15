const FarmerProfile = require('../models/FarmerProfile');
const User = require('../models/User');

// Get current logged-in farmer's profile
exports.getMyProfile = async (req, res) => {
  try {
    let profile = await FarmerProfile.findOne({ farmerId: req.user.id });
    
    if (!profile) {
      // Create empty initial profile if not yet created
      const user = await User.findById(req.user.id);
      profile = await FarmerProfile.create({
        farmerId: req.user.id,
        farmName: `${user.name}'s Farm`,
        contactPhone: user.phone || '',
        district: user.location?.city || 'Green District',
        state: user.location?.state || 'State',
        pincode: '500001'
      });
    }

    res.json({ profile });
  } catch (err) {
    console.error('getMyProfile error:', err);
    res.status(500).json({ message: 'Error retrieving farmer profile.' });
  }
};

// Update or create current farmer profile
exports.updateMyProfile = async (req, res) => {
  try {
    const {
      farmName,
      farmDescription,
      village,
      district,
      state,
      pincode,
      contactPhone,
      cropsCultivated,
      farmingMethod,
      deliveryAreas,
      pickupAvailable,
      deliveryAvailable
    } = req.body;

    let profileImage = req.file ? `/uploads/products/${req.file.filename}` : undefined;

    const updateFields = {
      ...(farmName && { farmName }),
      ...(farmDescription !== undefined && { farmDescription }),
      ...(village !== undefined && { village }),
      ...(district && { district }),
      ...(state && { state }),
      ...(pincode && { pincode }),
      ...(contactPhone !== undefined && { contactPhone }),
      ...(cropsCultivated && {
        cropsCultivated: Array.isArray(cropsCultivated)
          ? cropsCultivated
          : cropsCultivated.split(',').map((c) => c.trim()).filter(Boolean)
      }),
      ...(farmingMethod && { farmingMethod }),
      ...(deliveryAreas && {
        deliveryAreas: Array.isArray(deliveryAreas)
          ? deliveryAreas
          : deliveryAreas.split(',').map((a) => a.trim()).filter(Boolean)
      }),
      ...(pickupAvailable !== undefined && { pickupAvailable: pickupAvailable === true || pickupAvailable === 'true' }),
      ...(deliveryAvailable !== undefined && { deliveryAvailable: deliveryAvailable === true || deliveryAvailable === 'true' }),
      ...(profileImage && { profileImage })
    };

    const profile = await FarmerProfile.findOneAndUpdate(
      { farmerId: req.user.id },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ message: 'Farmer profile updated successfully!', profile });
  } catch (err) {
    console.error('updateMyProfile error:', err);
    res.status(500).json({ message: err.message || 'Error updating farmer profile.' });
  }
};

// Get public farmer profile by farmer user ID
exports.getPublicFarmerProfile = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const user = await User.findById(farmerId).select('name email phone location createdAt');
    if (!user) {
      return res.status(404).json({ message: 'Farmer not found.' });
    }

    const profile = await FarmerProfile.findOne({ farmerId });

    res.json({
      farmer: {
        id: user._id,
        name: user.name,
        joinedAt: user.createdAt,
        profile: profile || {
          farmName: `${user.name}'s Farm`,
          farmDescription: 'Authentic local produce directly from our farm.',
          district: user.location?.city || '',
          state: user.location?.state || '',
          farmingMethod: 'organic',
          pickupAvailable: true,
          deliveryAvailable: true
        }
      }
    });
  } catch (err) {
    console.error('getPublicFarmerProfile error:', err);
    res.status(500).json({ message: 'Error fetching farmer profile.' });
  }
};

