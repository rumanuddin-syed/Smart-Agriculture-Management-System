const Product = require('../models/Product');
const FarmerProfile = require('../models/FarmerProfile');
const User = require('../models/User');

// Public Marketplace - Search, filter, paginate
exports.getMarketplaceProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      isOrganic,
      minPrice,
      maxPrice,
      district,
      state,
      farmerId,
      sortBy = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const query = { status: 'active', stock: { $gt: 0 } };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (isOrganic === 'true' || isOrganic === true) {
      query.isOrganic = true;
    }

    if (minPrice || maxPrice) {
      query.pricePerUnit = {};
      if (minPrice) query.pricePerUnit.$gte = Number(minPrice);
      if (maxPrice) query.pricePerUnit.$lte = Number(maxPrice);
    }

    if (district) {
      query['location.district'] = { $regex: district, $options: 'i' };
    }

    if (state) {
      query['location.state'] = { $regex: state, $options: 'i' };
    }

    if (farmerId) {
      query.farmerId = farmerId;
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'price_asc') sortOption = { pricePerUnit: 1 };
    if (sortBy === 'price_desc') sortOption = { pricePerUnit: -1 };
    if (sortBy === 'name_asc') sortOption = { name: 1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('farmerId', 'name location phone')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Fetch corresponding farmer profiles for enriched badges
    const farmerIds = [...new Set(products.map((p) => p.farmerId?._id?.toString()).filter(Boolean))];
    const profiles = await FarmerProfile.find({ farmerId: { $in: farmerIds } });
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.farmerId.toString()] = p;
    });

    const enrichedProducts = products.map((prod) => {
      const fId = prod.farmerId?._id?.toString();
      const fProfile = fId ? profileMap[fId] : null;
      return {
        ...prod.toObject(),
        farmerInfo: {
          name: prod.farmerId?.name || 'Local Farmer',
          farmName: fProfile?.farmName || `${prod.farmerId?.name || 'Local'}'s Farm`,
          district: fProfile?.district || prod.location?.district || '',
          state: fProfile?.state || prod.location?.state || '',
          farmingMethod: fProfile?.farmingMethod || prod.farmingMethod,
          contactPhone: fProfile?.contactPhone || prod.farmerId?.phone || ''
        }
      };
    });

    res.json({
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      products: enrichedProducts
    });
  } catch (err) {
    console.error('getMarketplaceProducts error:', err);
    res.status(500).json({ message: 'Error fetching marketplace products.' });
  }
};

// Get single product detail
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('farmerId', 'name phone email createdAt');
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const farmerProfile = await FarmerProfile.findOne({ farmerId: product.farmerId?._id });

    res.json({
      product: {
        ...product.toObject(),
        farmerInfo: {
          id: product.farmerId?._id,
          name: product.farmerId?.name,
          farmName: farmerProfile?.farmName || `${product.farmerId?.name}'s Farm`,
          farmDescription: farmerProfile?.farmDescription || '',
          district: farmerProfile?.district || product.location?.district,
          state: farmerProfile?.state || product.location?.state,
          village: farmerProfile?.village || product.location?.village,
          pincode: farmerProfile?.pincode || product.location?.pincode,
          contactPhone: farmerProfile?.contactPhone || product.farmerId?.phone,
          farmingMethod: farmerProfile?.farmingMethod || product.farmingMethod,
          deliveryAvailable: farmerProfile?.deliveryAvailable ?? true,
          pickupAvailable: farmerProfile?.pickupAvailable ?? true
        }
      }
    });
  } catch (err) {
    console.error('getProductById error:', err);
    res.status(500).json({ message: 'Error retrieving product detail.' });
  }
};

// List all registered farmers for consumer browsing
exports.getAllFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' }).select('name email phone location createdAt');
    const profiles = await FarmerProfile.find();
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.farmerId.toString()] = p;
    });

    const activeProducts = await Product.aggregate([
      { $match: { status: 'active', stock: { $gt: 0 } } },
      { $group: { _id: '$farmerId', productCount: { $sum: 1 } } }
    ]);
    const countMap = {};
    activeProducts.forEach((ap) => {
      countMap[ap._id.toString()] = ap.productCount;
    });

    const results = farmers.map((f) => {
      const fProfile = profileMap[f._id.toString()];
      return {
        id: f._id,
        name: f.name,
        farmName: fProfile?.farmName || `${f.name}'s Farm`,
        farmDescription: fProfile?.farmDescription || 'Farm-fresh quality goods directly from our land.',
        district: fProfile?.district || f.location?.city || 'Green Valley',
        state: fProfile?.state || f.location?.state || 'Agricultural Belt',
        farmingMethod: fProfile?.farmingMethod || 'organic',
        activeProductsCount: countMap[f._id.toString()] || 0,
        joinedAt: f.createdAt
      };
    });

    res.json({ farmers: results });
  } catch (err) {
    console.error('getAllFarmers error:', err);
    res.status(500).json({ message: 'Error fetching farmer directory.' });
  }
};

