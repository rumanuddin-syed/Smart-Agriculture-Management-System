const Product = require('../models/Product');
const FarmerProfile = require('../models/FarmerProfile');

// Add new product listing
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      pricePerUnit,
      unit,
      stock,
      minOrderQty,
      maxOrderQty,
      isOrganic,
      farmingMethod,
      harvestDate,
      freshnessDuration,
      village,
      district,
      state,
      pincode
    } = req.body;

    if (!name || !category || !pricePerUnit || stock === undefined) {
      return res.status(400).json({ message: 'Name, category, price, and stock are required.' });
    }

    const images = req.files ? req.files.map((f) => `/uploads/products/${f.filename}`) : [];

    // Inherit farmer location if not explicitly provided
    let prodLocation = { village, district, state, pincode };
    if (!district || !state) {
      const farmerProf = await FarmerProfile.findOne({ farmerId: req.user.id });
      if (farmerProf) {
        prodLocation = {
          village: village || farmerProf.village,
          district: district || farmerProf.district,
          state: state || farmerProf.state,
          pincode: pincode || farmerProf.pincode
        };
      }
    }

    const product = await Product.create({
      farmerId: req.user.id,
      name,
      category,
      description: description || '',
      images,
      pricePerUnit: Number(pricePerUnit),
      unit: unit || 'kg',
      stock: Number(stock),
      minOrderQty: Number(minOrderQty) || 1,
      maxOrderQty: Number(maxOrderQty) || 1000,
      isOrganic: isOrganic === true || isOrganic === 'true',
      farmingMethod: farmingMethod || 'organic',
      harvestDate: harvestDate ? new Date(harvestDate) : undefined,
      freshnessDuration: freshnessDuration || '3-5 days',
      location: prodLocation,
      status: Number(stock) > 0 ? 'active' : 'sold_out'
    });

    res.status(201).json({ message: 'Product published successfully!', product });
  } catch (err) {
    console.error('createProduct error:', err);
    res.status(500).json({ message: err.message || 'Error creating product listing.' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ _id: id, farmerId: req.user.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized.' });
    }

    const {
      name,
      category,
      description,
      pricePerUnit,
      unit,
      stock,
      minOrderQty,
      maxOrderQty,
      isOrganic,
      farmingMethod,
      harvestDate,
      freshnessDuration,
      status
    } = req.body;

    if (name) product.name = name;
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    if (pricePerUnit !== undefined) product.pricePerUnit = Number(pricePerUnit);
    if (unit) product.unit = unit;
    if (stock !== undefined) {
      product.stock = Number(stock);
      if (product.stock <= 0 && product.status === 'active') {
        product.status = 'sold_out';
      } else if (product.stock > 0 && product.status === 'sold_out') {
        product.status = 'active';
      }
    }
    if (minOrderQty !== undefined) product.minOrderQty = Number(minOrderQty);
    if (maxOrderQty !== undefined) product.maxOrderQty = Number(maxOrderQty);
    if (isOrganic !== undefined) product.isOrganic = isOrganic === true || isOrganic === 'true';
    if (farmingMethod) product.farmingMethod = farmingMethod;
    if (harvestDate) product.harvestDate = new Date(harvestDate);
    if (freshnessDuration) product.freshnessDuration = freshnessDuration;
    if (status) product.status = status;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => `/uploads/products/${f.filename}`);
      product.images = [...product.images, ...newImages];
    }

    await product.save();
    res.json({ message: 'Product updated successfully!', product });
  } catch (err) {
    console.error('updateProduct error:', err);
    res.status(500).json({ message: err.message || 'Error updating product.' });
  }
};

// Get current farmer's products with stats
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmerId: req.user.id }).sort({ createdAt: -1 });
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
    const soldOutCount = products.filter((p) => p.stock === 0 || p.status === 'sold_out').length;
    const activeCount = products.filter((p) => p.status === 'active' && p.stock > 0).length;

    res.json({
      total: products.length,
      activeCount,
      lowStockCount,
      soldOutCount,
      products
    });
  } catch (err) {
    console.error('getMyProducts error:', err);
    res.status(500).json({ message: 'Error retrieving your products.' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndDelete({ _id: id, farmerId: req.user.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized.' });
    }
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('deleteProduct error:', err);
    res.status(500).json({ message: 'Error deleting product.' });
  }
};

// Toggle product status (active <-> inactive)
exports.toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ _id: id, farmerId: req.user.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized.' });
    }

    if (product.status === 'active') {
      product.status = 'inactive';
    } else if (product.status === 'inactive') {
      product.status = product.stock > 0 ? 'active' : 'sold_out';
    } else if (product.status === 'sold_out' && product.stock > 0) {
      product.status = 'active';
    }

    await product.save();
    res.json({ message: `Product status changed to ${product.status}.`, product });
  } catch (err) {
    console.error('toggleProductStatus error:', err);
    res.status(500).json({ message: 'Error toggling product status.' });
  }
};

