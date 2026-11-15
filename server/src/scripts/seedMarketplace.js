const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const connectDB = require('../config/db');

const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const Product = require('../models/Product');
const CultivationExpense = require('../models/CultivationExpense');

async function seedMarketplace() {
  await connectDB();
  console.log('🌱 Connected to MongoDB for Marketplace Seeding...');

  // 1. Create or Find Farmers
  const farmersData = [
    {
      name: 'Ramesh Patel',
      email: 'ramesh.farmer@example.com',
      password: 'password123',
      phone: '+91 98765 43210',
      role: 'farmer',
      location: { city: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898 },
      profile: {
        farmName: 'Patel Organic Farms',
        farmDescription: 'Generations of traditional organic vegetable farming using cow dung manure and drip irrigation.',
        village: 'Dindori',
        district: 'Nashik',
        state: 'Maharashtra',
        pincode: '422202',
        contactPhone: '+91 98765 43210',
        farmingMethod: 'organic',
        cropsCultivated: ['Tomato', 'Onion', 'Potato', 'Green Chilli'],
        deliveryAreas: ['Nashik', 'Mumbai', 'Pune', '422001', '422002'],
        pickupAvailable: true,
        deliveryAvailable: true
      }
    },
    {
      name: 'Gurpreet Singh',
      email: 'gurpreet.farmer@example.com',
      password: 'password123',
      phone: '+91 98123 45678',
      role: 'farmer',
      location: { city: 'Karnal', state: 'Haryana', lat: 29.6857, lng: 76.9905 },
      profile: {
        farmName: 'Golden Grain Agro',
        farmDescription: 'Prime quality basmati paddy, stone-ground wheat, and organic pulses harvested straight from Haryana fertile plains.',
        village: 'Taraori',
        district: 'Karnal',
        state: 'Haryana',
        pincode: '132116',
        contactPhone: '+91 98123 45678',
        farmingMethod: 'conventional',
        cropsCultivated: ['Basmati Rice', 'Sharbati Wheat', 'Yellow Mustard', 'Chickpeas'],
        deliveryAreas: ['Karnal', 'Delhi NCR', 'Chandigarh', '110001'],
        pickupAvailable: true,
        deliveryAvailable: true
      }
    },
    {
      name: 'Lakshmi Devi',
      email: 'lakshmi.farmer@example.com',
      password: 'password123',
      phone: '+91 94455 66778',
      role: 'farmer',
      location: { city: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lng: 78.146 },
      profile: {
        farmName: 'Green Orchard & Spice Grove',
        farmDescription: 'Naturally ripened tropical mangoes, organic turmeric, and fresh bananas grown chemical-free in the Kaveri delta.',
        village: 'Attur',
        district: 'Salem',
        state: 'Tamil Nadu',
        pincode: '636102',
        contactPhone: '+91 94455 66778',
        farmingMethod: 'natural',
        cropsCultivated: ['Alphonso Mango', 'Turmeric', 'Coconut', 'Cardamom'],
        deliveryAreas: ['Salem', 'Chennai', 'Bengaluru', 'Coimbatore'],
        pickupAvailable: true,
        deliveryAvailable: true
      }
    }
  ];

  const createdFarmers = [];

  for (const fData of farmersData) {
    let user = await User.findOne({ email: fData.email });
    if (!user) {
      user = await User.create({
        name: fData.name,
        email: fData.email,
        password: fData.password,
        phone: fData.phone,
        role: fData.role,
        location: fData.location
      });
      console.log(`👤 Created farmer user: ${user.name}`);
    }

    await FarmerProfile.findOneAndUpdate(
      { farmerId: user._id },
      { ...fData.profile, farmerId: user._id },
      { upsert: true, new: true }
    );
    createdFarmers.push(user);
  }

  // 2. Create Consumer User
  let consumer = await User.findOne({ email: 'rahul.consumer@example.com' });
  if (!consumer) {
    consumer = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul.consumer@example.com',
      password: 'password123',
      phone: '+91 99887 76655',
      role: 'consumer',
      location: { city: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777 }
    });
    console.log(`🛒 Created consumer user: ${consumer.name}`);
  }

  // 3. Clear and seed realistic products
  const [farmerA, farmerB, farmerC] = createdFarmers;

  const sampleProducts = [
    // Farmer A: Ramesh Patel (Vegetables)
    {
      farmerId: farmerA._id,
      name: 'Farm Fresh Organic Red Tomatoes',
      category: 'Vegetables',
      description: 'Vine-ripened, pesticide-free juicy red tomatoes. Picked fresh this morning. Ideal for curries, salads, and puree.',
      images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'],
      pricePerUnit: 35,
      unit: 'kg',
      stock: 120,
      minOrderQty: 1,
      maxOrderQty: 25,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '5-7 days',
      location: { village: 'Dindori', district: 'Nashik', state: 'Maharashtra', pincode: '422202' },
      status: 'active'
    },
    {
      farmerId: farmerA._id,
      name: 'Nashik Red Quality Onions',
      category: 'Vegetables',
      description: 'Famous Nashik medium-sized dry red onions with high pungency and long shelf life.',
      images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop'],
      pricePerUnit: 28,
      unit: 'kg',
      stock: 350,
      minOrderQty: 2,
      maxOrderQty: 50,
      isOrganic: false,
      farmingMethod: 'conventional',
      freshnessDuration: '3-4 weeks',
      location: { village: 'Dindori', district: 'Nashik', state: 'Maharashtra', pincode: '422202' },
      status: 'active'
    },
    {
      farmerId: farmerA._id,
      name: 'Farm Fresh Baby Potatoes',
      category: 'Vegetables',
      description: 'Golden baby potatoes, low starch, excellent for roasting and dum aloo curries.',
      images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop'],
      pricePerUnit: 30,
      unit: 'kg',
      stock: 8, // Low stock example!
      minOrderQty: 1,
      maxOrderQty: 20,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '2 weeks',
      location: { village: 'Dindori', district: 'Nashik', state: 'Maharashtra', pincode: '422202' },
      status: 'active'
    },

    // Farmer B: Gurpreet Singh (Grains & Pulses)
    {
      farmerId: farmerB._id,
      name: 'Traditional 1121 Royal Basmati Rice',
      category: 'Grains & Cereals',
      description: 'Aged 2 years, ultra-long slender grain basmati rice with exotic natural aroma. Directly milled from our farm.',
      images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop'],
      pricePerUnit: 110,
      unit: 'kg',
      stock: 500,
      minOrderQty: 5,
      maxOrderQty: 100,
      isOrganic: false,
      farmingMethod: 'conventional',
      freshnessDuration: '12 months',
      location: { village: 'Taraori', district: 'Karnal', state: 'Haryana', pincode: '132116' },
      status: 'active'
    },
    {
      farmerId: farmerB._id,
      name: 'Organic Sharbati Whole Wheat Atta Grain',
      category: 'Grains & Cereals',
      description: 'Golden heavy rainfed MP-style Sharbati wheat grains. Produces super soft and fluffy rotis.',
      images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop'],
      pricePerUnit: 48,
      unit: 'kg',
      stock: 400,
      minOrderQty: 10,
      maxOrderQty: 100,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '6 months',
      location: { village: 'Taraori', district: 'Karnal', state: 'Haryana', pincode: '132116' },
      status: 'active'
    },
    {
      farmerId: farmerB._id,
      name: 'Unpolished Organic Yellow Moong Dal',
      category: 'Pulses',
      description: 'Pure chemical-free split yellow moong lentils with high protein content and natural taste.',
      images: ['https://images.unsplash.com/photo-1585994192701-f1a505c817ea?w=600&auto=format&fit=crop'],
      pricePerUnit: 140,
      unit: 'kg',
      stock: 80,
      minOrderQty: 1,
      maxOrderQty: 20,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '6 months',
      location: { village: 'Taraori', district: 'Karnal', state: 'Haryana', pincode: '132116' },
      status: 'active'
    },

    // Farmer C: Lakshmi Devi (Fruits & Spices)
    {
      farmerId: farmerC._id,
      name: 'Salem Alphonso (Hapus) Mangoes',
      category: 'Fruits',
      description: 'Tree-ripened, carbide-free aromatic sweet Alphonso mangoes. Plucked by hand at optimum sweetness.',
      images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop'],
      pricePerUnit: 350,
      unit: 'bundle', // Dozen box
      stock: 45,
      minOrderQty: 1,
      maxOrderQty: 10,
      isOrganic: true,
      farmingMethod: 'natural',
      freshnessDuration: '5-8 days',
      location: { village: 'Attur', district: 'Salem', state: 'Tamil Nadu', pincode: '636102' },
      status: 'active'
    },
    {
      farmerId: farmerC._id,
      name: 'Organic Salem High-Curcumin Turmeric Powder',
      category: 'Spices',
      description: 'Pure wood-pressed ground turmeric with 4.5% natural curcumin content. Direct from organic harvest.',
      images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop'],
      pricePerUnit: 220,
      unit: 'kg',
      stock: 60,
      minOrderQty: 1,
      maxOrderQty: 15,
      isOrganic: true,
      farmingMethod: 'natural',
      freshnessDuration: '12 months',
      location: { village: 'Attur', district: 'Salem', state: 'Tamil Nadu', pincode: '636102' },
      status: 'active'
    }
  ];

  for (const prodData of sampleProducts) {
    await Product.findOneAndUpdate(
      { name: prodData.name, farmerId: prodData.farmerId },
      prodData,
      { upsert: true, new: true }
    );
  }
  console.log(`📦 Seeded ${sampleProducts.length} diverse produce items across 3 farmers!`);

  // 4. Seed initial Cultivation Expenses for Farmer A (Ramesh)
  const initialExpenses = [
    {
      farmerId: farmerA._id,
      category: 'Seeds',
      amount: 4500,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      cropName: 'Tomato',
      description: 'Hybrid disease-resistant certified organic tomato seeds.'
    },
    {
      farmerId: farmerA._id,
      category: 'Organic Treatments',
      amount: 3200,
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      cropName: 'Tomato',
      description: 'Neem oil cake and bio-fungicide treatment.'
    },
    {
      farmerId: farmerA._id,
      category: 'Labour',
      amount: 7500,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      cropName: 'Tomato & Onion',
      description: 'Weeding, staking, and harvesting labour charges.'
    },
    {
      farmerId: farmerA._id,
      category: 'Irrigation',
      amount: 1800,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      cropName: 'Onion',
      description: 'Solar pump maintenance and drip line cleaning.'
    }
  ];

  for (const exp of initialExpenses) {
    await CultivationExpense.findOneAndUpdate(
      { farmerId: exp.farmerId, description: exp.description },
      exp,
      { upsert: true, new: true }
    );
  }
  console.log(`💰 Seeded ${initialExpenses.length} cultivation expenses for Farmer Ramesh Patel.`);

  console.log('✅ Marketplace seeding complete!');
  process.exit(0);
}

seedMarketplace().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});

