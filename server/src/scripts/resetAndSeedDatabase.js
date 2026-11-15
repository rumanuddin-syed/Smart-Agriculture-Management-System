const mongoose = require('mongoose');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');

// Import all application models
const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const Product = require('../models/Product');
const CheckoutOrder = require('../models/CheckoutOrder');
const FarmerSuborder = require('../models/FarmerSuborder');
const PaymentProof = require('../models/PaymentProof');
const CultivationExpense = require('../models/CultivationExpense');
const Notification = require('../models/Notification');
const CropRecommendation = require('../models/CropRecommendation');
const DiseasePrediction = require('../models/DiseasePrediction');

// Ask confirmation unless passed --yes or --confirm
async function confirmReset() {
  if (process.argv.includes('--yes') || process.argv.includes('--confirm')) {
    return true;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(
      '⚠️  WARNING: This will completely CLEAR and RESET application data in database "' +
        (process.env.MONGO_URI ? 'smart_agri' : 'in-memory') +
        '".\nType "RESET" to confirm: ',
      (answer) => {
        rl.close();
        resolve(answer.trim() === 'RESET');
      }
    );
  });
}

async function runResetAndSeed() {
  const isConfirmed = await confirmReset();
  if (!isConfirmed) {
    console.log('❌ Reset cancelled by user. No data was modified.');
    process.exit(0);
  }

  console.log('🔄 Connecting to database...');
  await connectDB();

  console.log('🧹 Clearing application data collections...');
  await Promise.all([
    User.deleteMany({}),
    FarmerProfile.deleteMany({}),
    Product.deleteMany({}),
    CheckoutOrder.deleteMany({}),
    FarmerSuborder.deleteMany({}),
    PaymentProof.deleteMany({}),
    CultivationExpense.deleteMany({}),
    Notification.deleteMany({}),
    CropRecommendation.deleteMany({}),
    DiseasePrediction.deleteMany({})
  ]);
  console.log('✅ Application collections cleared successfully. (Preserved knowledge bases).');

  // ==========================================
  // 1. SEED EXACT 7 CHARACTERS
  // ==========================================
  console.log('👤 Seeding the 7 interconnected characters...');

  // Admin
  const admin = await User.create({
    name: 'Main Admin',
    email: 'admin@gmail.com',
    password: 'Admin@12345',
    phone: '+91 94400 00000',
    role: 'admin',
    location: { city: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867 }
  });

  // Farmer 1
  const farmer1 = await User.create({
    name: 'Ramesh Kumar',
    email: 'user1@gmail.com',
    password: 'Farmer@12345',
    phone: '+91 98480 11111',
    role: 'farmer',
    location: { city: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867 }
  });

  // Farmer 2
  const farmer2 = await User.create({
    name: 'Suresh Reddy',
    email: 'user2@gmail.com',
    password: 'Farmer@12345',
    phone: '+91 98490 22222',
    role: 'farmer',
    location: { city: 'Warangal', state: 'Telangana', lat: 17.9689, lng: 79.5941 }
  });

  // Farmer 3
  const farmer3 = await User.create({
    name: 'Lakshmi Devi',
    email: 'user3@gmail.com',
    password: 'Farmer@12345',
    phone: '+91 98470 33333',
    role: 'farmer',
    location: { city: 'Karimnagar', state: 'Telangana', lat: 18.4386, lng: 79.1288 }
  });

  // Consumer 1
  const consumer1 = await User.create({
    name: 'Arjun Sharma',
    email: 'consumer1@gmail.com',
    password: 'Consumer@12345',
    phone: '+91 99880 44444',
    role: 'consumer',
    location: { city: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867 }
  });

  // Consumer 2
  const consumer2 = await User.create({
    name: 'Priya Reddy',
    email: 'consumer2@gmail.com',
    password: 'Consumer@12345',
    phone: '+91 99890 55555',
    role: 'consumer',
    location: { city: 'Warangal', state: 'Telangana', lat: 17.9689, lng: 79.5941 }
  });

  // Consumer 3
  const consumer3 = await User.create({
    name: 'Rahul Verma',
    email: 'consumer3@gmail.com',
    password: 'Consumer@12345',
    phone: '+91 99870 66666',
    role: 'consumer',
    location: { city: 'Karimnagar', state: 'Telangana', lat: 18.4386, lng: 79.1288 }
  });

  console.log('✅ Created 1 Admin, 3 Farmers, and 3 Consumers.');

  // ==========================================
  // 2. SEED FARMER PROFILES
  // ==========================================
  console.log('🏡 Creating farmer estate profiles...');

  await FarmerProfile.create([
    {
      farmerId: farmer1._id,
      farmName: 'Green Valley Farms',
      farmDescription:
        'Cultivating nutrient-dense, pesticide-free fresh vegetables and daily greens using vermicompost and sustainable drip irrigation in Shamshabad plains.',
      village: 'Shamshabad',
      district: 'Hyderabad',
      state: 'Telangana',
      pincode: '501218',
      contactPhone: '+91 98480 11111',
      farmingMethod: 'organic',
      cropsCultivated: ['Fresh Tomatoes', 'Red Onions', 'Potatoes', 'Green Chillies', 'Brinjal', 'Spinach', 'Okra', 'Fresh Coriander'],
      deliveryAreas: ['Hyderabad', 'Secunderabad', 'Cyberabad', '500001', '500034', '500081'],
      pickupAvailable: true,
      deliveryAvailable: true
    },
    {
      farmerId: farmer2._id,
      farmName: 'Sunrise Organic Farms',
      farmDescription:
        'Centuries-old family heritage farm producing native single-origin Sona Masoori organic rice, stone-milled wheat, and protein-rich pulses in the fertile Kakatiya basin.',
      village: 'Hanamkonda',
      district: 'Warangal',
      state: 'Telangana',
      pincode: '506001',
      contactPhone: '+91 98490 22222',
      farmingMethod: 'organic',
      cropsCultivated: ['Organic Rice', 'Wheat', 'Maize', 'Groundnuts', 'Turmeric', 'Green Gram', 'Red Gram', 'Organic Tomatoes'],
      deliveryAreas: ['Warangal', 'Hanamkonda', 'Kazipet', 'Hyderabad', '506001', '506002'],
      pickupAvailable: true,
      deliveryAvailable: true
    },
    {
      farmerId: farmer3._id,
      farmName: 'Lakshmi Fresh Produce',
      farmDescription:
        'Organic multi-tier fruit orchards and seasonal vegetables nurtured along the serene banks of the Manair river. Hand-picked at peak ripeness.',
      village: 'Thimmapur',
      district: 'Karimnagar',
      state: 'Telangana',
      pincode: '505001',
      contactPhone: '+91 98470 33333',
      farmingMethod: 'natural',
      cropsCultivated: ['Fresh Mangoes', 'Bananas', 'Papaya', 'Pomegranates', 'Sweet Corn', 'Carrots', 'Cauliflower', 'Cabbage'],
      deliveryAreas: ['Karimnagar', 'Warangal', 'Hyderabad', '505001', '505527'],
      pickupAvailable: true,
      deliveryAvailable: true
    }
  ]);
  console.log('✅ Farmer profiles established.');

  // ==========================================
  // 3. SEED 24 PRODUCTS (8 PER FARMER)
  // ==========================================
  console.log('📦 Seeding 24 agricultural products across the 3 farmers...');

  const productsData = [
    // Farmer 1: Ramesh Kumar (8 items)
    {
      farmerId: farmer1._id,
      name: 'Fresh Tomatoes',
      category: 'Vegetables',
      description: 'Vine-ripened, juicy red tomatoes freshly harvested from Green Valley Farms. Zero synthetic pesticides.',
      images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'],
      pricePerUnit: 35,
      unit: 'kg',
      stock: 140,
      minOrderQty: 1,
      maxOrderQty: 25,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '5-7 days',
      location: { village: 'Shamshabad', district: 'Hyderabad', state: 'Telangana', pincode: '501218' },
      status: 'active'
    },
    {
      farmerId: farmer1._id,
      name: 'Red Onions',
      category: 'Vegetables',
      description: 'High-pungency, sun-cured firm red onions with superior storage life. Hand-sorted for premium size.',
      images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop'],
      pricePerUnit: 28,
      unit: 'kg',
      stock: 220,
      minOrderQty: 1,
      maxOrderQty: 50,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '3-4 weeks',
      location: { village: 'Shamshabad', district: 'Hyderabad', state: 'Telangana', pincode: '501218' },
      status: 'active'
    },
    {
      farmerId: farmer1._id,
      name: 'Potatoes',
      category: 'Vegetables',
      description: 'Nutritious golden farm-fresh potatoes with thin skin, low sugar, and excellent starch profile for curries.',
      images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop'],
      pricePerUnit: 32,
      unit: 'kg',
      stock: 190,
      minOrderQty: 1,
      maxOrderQty: 30,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '2-3 weeks',
      location: { village: 'Shamshabad', district: 'Hyderabad', state: 'Telangana', pincode: '501218' },
      status: 'active'
    },
    {
      farmerId: farmer1._id,
      name: 'Green Chillies',
      category: 'Vegetables',
      description: 'Fiery hot, fresh tender green chillies plucked same-day. Gives authentic spice to Telugu cooking.',
      images: ['https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop'],
      pricePerUnit: 60,
      unit: 'kg',
      stock: 35,
      minOrderQty: 1,
      maxOrderQty: 5,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '7-10 days',
      location: { village: 'Shamshabad', district: 'Hyderabad', state: 'Telangana', pincode: '501218' },
      status: 'active'
    },
    {
      farmerId: farmer1._id,
      name: 'Brinjal',
      category: 'Vegetables',
      description: 'Glossy purple tender eggplants / brinjals with small seeds. Melt-in-mouth texture for Gutti Vankaya curry.',
      images: ['https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=600&auto=format&fit=crop'],
      pricePerUnit: 40,
      unit: 'kg',
      stock: 55,
      minOrderQty: 1,
      maxOrderQty: 10,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '4-6 days',
      location: { village: 'Shamshabad', district: 'Hyderabad', state: 'Telangana', pincode: '501218' },
      status: 'active'
    },
    {
      farmerId: farmer1._id,
      name: 'Spinach',
      category: 'Vegetables',
      description: 'Crisp, broad-leaf organic Palak (spinach) grown under natural shade netting. High in dietary iron.',
      images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop'],
      pricePerUnit: 20,
      unit: 'bundle',
      stock: 75,
      minOrderQty: 1,
      maxOrderQty: 20,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '2-3 days',
      location: { village: 'Shamshabad', district: 'Hyderabad', state: 'Telangana', pincode: '501218' },
      status: 'active'
    },
    {
      farmerId: farmer1._id,
      name: 'Okra',
      category: 'Vegetables',
      description: 'Tender ladyfinger / bhendi harvested early morning when soft. Zero fibrous hardness.',
      images: ['https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=600&auto=format&fit=crop'],
      pricePerUnit: 45,
      unit: 'kg',
      stock: 70,
      minOrderQty: 1,
      maxOrderQty: 15,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '4-5 days',
      location: { village: 'Shamshabad', district: 'Hyderabad', state: 'Telangana', pincode: '501218' },
      status: 'active'
    },
    {
      farmerId: farmer1._id,
      name: 'Fresh Coriander',
      category: 'Vegetables',
      description: 'Intensely fragrant native variety fresh coriander leaves with tender roots and vibrant aroma.',
      images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop'],
      pricePerUnit: 15,
      unit: 'bundle',
      stock: 45,
      minOrderQty: 1,
      maxOrderQty: 20,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '3-4 days',
      location: { village: 'Shamshabad', district: 'Hyderabad', state: 'Telangana', pincode: '501218' },
      status: 'active'
    },

    // Farmer 2: Suresh Reddy (8 items)
    {
      farmerId: farmer2._id,
      name: 'Organic Rice',
      category: 'Grains & Cereals',
      description: 'Aged unpolished Sona Masoori raw organic rice. Light, fragrant, and easily digestible staple.',
      images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop'],
      pricePerUnit: 65,
      unit: 'kg',
      stock: 480,
      minOrderQty: 5,
      maxOrderQty: 100,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '12 months',
      location: { village: 'Hanamkonda', district: 'Warangal', state: 'Telangana', pincode: '506001' },
      status: 'active'
    },
    {
      farmerId: farmer2._id,
      name: 'Wheat',
      category: 'Grains & Cereals',
      description: 'Plump golden Sharbati wheat grains grown in black cotton soil. Yields soft, sweet rotis.',
      images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop'],
      pricePerUnit: 45,
      unit: 'kg',
      stock: 380,
      minOrderQty: 5,
      maxOrderQty: 100,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '12 months',
      location: { village: 'Hanamkonda', district: 'Warangal', state: 'Telangana', pincode: '506001' },
      status: 'active'
    },
    {
      farmerId: farmer2._id,
      name: 'Maize',
      category: 'Grains & Cereals',
      description: 'Sun-dried high-grade yellow maize grains for flour, poultry feed, and traditional porridge.',
      images: ['https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop'],
      pricePerUnit: 30,
      unit: 'kg',
      stock: 290,
      minOrderQty: 5,
      maxOrderQty: 100,
      isOrganic: false,
      farmingMethod: 'conventional',
      freshnessDuration: '12 months',
      location: { village: 'Hanamkonda', district: 'Warangal', state: 'Telangana', pincode: '506001' },
      status: 'active'
    },
    {
      farmerId: farmer2._id,
      name: 'Groundnuts',
      category: 'Pulses',
      description: 'Freshly dug native Spanish-variety peanuts with high oil content and crunchy sweetness.',
      images: ['https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=600&auto=format&fit=crop'],
      pricePerUnit: 120,
      unit: 'kg',
      stock: 140,
      minOrderQty: 1,
      maxOrderQty: 25,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '6 months',
      location: { village: 'Hanamkonda', district: 'Warangal', state: 'Telangana', pincode: '506001' },
      status: 'active'
    },
    {
      farmerId: farmer2._id,
      name: 'Turmeric',
      category: 'Spices',
      description: 'Pure single-origin Salem turmeric rhizomes and ground powder with 4.8% high natural curcumin.',
      images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop'],
      pricePerUnit: 180,
      unit: 'kg',
      stock: 75,
      minOrderQty: 1,
      maxOrderQty: 10,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '12 months',
      location: { village: 'Hanamkonda', district: 'Warangal', state: 'Telangana', pincode: '506001' },
      status: 'active'
    },
    {
      farmerId: farmer2._id,
      name: 'Green Gram',
      category: 'Pulses',
      description: 'Unpolished whole green moong beans. Perfect for healthy sprouting, dal, and pesarattu batter.',
      images: ['https://images.unsplash.com/photo-1585994192701-f1a505c817ea?w=600&auto=format&fit=crop'],
      pricePerUnit: 110,
      unit: 'kg',
      stock: 115,
      minOrderQty: 1,
      maxOrderQty: 20,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '9 months',
      location: { village: 'Hanamkonda', district: 'Warangal', state: 'Telangana', pincode: '506001' },
      status: 'active'
    },
    {
      farmerId: farmer2._id,
      name: 'Red Gram',
      category: 'Pulses',
      description: 'Traditional desi unpolished Toor Dal (red gram split) with rich natural aroma and rapid cook time.',
      images: ['https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&auto=format&fit=crop'],
      pricePerUnit: 140,
      unit: 'kg',
      stock: 140,
      minOrderQty: 1,
      maxOrderQty: 25,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '9 months',
      location: { village: 'Hanamkonda', district: 'Warangal', state: 'Telangana', pincode: '506001' },
      status: 'active'
    },
    {
      farmerId: farmer2._id,
      name: 'Organic Tomatoes',
      category: 'Vegetables',
      description: 'Warangal heritage open-pollinated beefy organic tomatoes with intense rich flavor.',
      images: ['https://images.unsplash.com/photo-1546470427-0d4db154ceb7?w=600&auto=format&fit=crop'],
      pricePerUnit: 48,
      unit: 'kg',
      stock: 85,
      minOrderQty: 1,
      maxOrderQty: 20,
      isOrganic: true,
      farmingMethod: 'organic',
      freshnessDuration: '5-7 days',
      location: { village: 'Hanamkonda', district: 'Warangal', state: 'Telangana', pincode: '506001' },
      status: 'active'
    },

    // Farmer 3: Lakshmi Devi (8 items)
    {
      farmerId: farmer3._id,
      name: 'Fresh Mangoes',
      category: 'Fruits',
      description: 'Tree-ripened, naturally sweet Banganapalli mangoes. Carbide-free, aromatic, and rich in nectar.',
      images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop'],
      pricePerUnit: 160,
      unit: 'kg',
      stock: 90,
      minOrderQty: 2,
      maxOrderQty: 20,
      isOrganic: true,
      farmingMethod: 'natural',
      freshnessDuration: '5-8 days',
      location: { village: 'Thimmapur', district: 'Karimnagar', state: 'Telangana', pincode: '505001' },
      status: 'active'
    },
    {
      farmerId: farmer3._id,
      name: 'Bananas',
      category: 'Fruits',
      description: 'Sweet Yelakki / Robusta bananas grown without chemical accelerants. Energy-rich family snack.',
      images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop'],
      pricePerUnit: 40,
      unit: 'bundle', // dozen
      stock: 110,
      minOrderQty: 1,
      maxOrderQty: 10,
      isOrganic: true,
      farmingMethod: 'natural',
      freshnessDuration: '4-6 days',
      location: { village: 'Thimmapur', district: 'Karimnagar', state: 'Telangana', pincode: '505001' },
      status: 'active'
    },
    {
      farmerId: farmer3._id,
      name: 'Papaya',
      category: 'Fruits',
      description: 'Sweet Red Lady organic papaya with vibrant orange flesh and high digestive enzymes.',
      images: ['https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600&auto=format&fit=crop'],
      pricePerUnit: 35,
      unit: 'kg',
      stock: 75,
      minOrderQty: 1,
      maxOrderQty: 15,
      isOrganic: true,
      farmingMethod: 'natural',
      freshnessDuration: '4-5 days',
      location: { village: 'Thimmapur', district: 'Karimnagar', state: 'Telangana', pincode: '505001' },
      status: 'active'
    },
    {
      farmerId: farmer3._id,
      name: 'Pomegranates',
      category: 'Fruits',
      description: 'Ruby-red Bhagwa pomegranates with soft juicy seeds and high antioxidant profile.',
      images: ['https://images.unsplash.com/photo-1541344999736-83eca872f242?w=600&auto=format&fit=crop'],
      pricePerUnit: 180,
      unit: 'kg',
      stock: 55,
      minOrderQty: 1,
      maxOrderQty: 10,
      isOrganic: true,
      farmingMethod: 'natural',
      freshnessDuration: '10-14 days',
      location: { village: 'Thimmapur', district: 'Karimnagar', state: 'Telangana', pincode: '505001' },
      status: 'active'
    },
    {
      farmerId: farmer3._id,
      name: 'Sweet Corn',
      category: 'Vegetables',
      description: 'Crisp, sweet, milky yellow sweet corn cobs freshly picked at dawn. Delicious steamed or roasted.',
      images: ['https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop'],
      pricePerUnit: 25,
      unit: 'piece',
      stock: 140,
      minOrderQty: 2,
      maxOrderQty: 30,
      isOrganic: true,
      farmingMethod: 'natural',
      freshnessDuration: '5-7 days',
      location: { village: 'Thimmapur', district: 'Karimnagar', state: 'Telangana', pincode: '505001' },
      status: 'active'
    },
    {
      farmerId: farmer3._id,
      name: 'Carrots',
      category: 'Vegetables',
      description: 'Crunchy, naturally sweet deep orange carrots grown in sandy loam soil. Rich in beta-carotene.',
      images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop'],
      pricePerUnit: 50,
      unit: 'kg',
      stock: 65,
      minOrderQty: 1,
      maxOrderQty: 15,
      isOrganic: true,
      farmingMethod: 'natural',
      freshnessDuration: '10-14 days',
      location: { village: 'Thimmapur', district: 'Karimnagar', state: 'Telangana', pincode: '505001' },
      status: 'active'
    },
    {
      farmerId: farmer3._id,
      name: 'Cauliflower',
      category: 'Vegetables',
      description: 'Compact, snow-white heavy cauliflower curds wrapped in protective green leaves.',
      images: ['https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop'],
      pricePerUnit: 35,
      unit: 'piece',
      stock: 60,
      minOrderQty: 1,
      maxOrderQty: 10,
      isOrganic: true,
      farmingMethod: 'natural',
      freshnessDuration: '5-7 days',
      location: { village: 'Thimmapur', district: 'Karimnagar', state: 'Telangana', pincode: '505001' },
      status: 'active'
    },
    {
      farmerId: farmer3._id,
      name: 'Cabbage',
      category: 'Vegetables',
      description: 'Firm, heavy round green cabbage heads with tightly layered crisp leaves. Zero chemical residues.',
      images: ['https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&auto=format&fit=crop'],
      pricePerUnit: 30,
      unit: 'piece',
      stock: 75,
      minOrderQty: 1,
      maxOrderQty: 15,
      isOrganic: true,
      farmingMethod: 'natural',
      freshnessDuration: '7-10 days',
      location: { village: 'Thimmapur', district: 'Karimnagar', state: 'Telangana', pincode: '505001' },
      status: 'active'
    }
  ];

  const createdProducts = await Product.create(productsData);
  console.log(`✅ Created ${createdProducts.length} verified products.`);

  // Lookup map by product name
  const pMap = {};
  createdProducts.forEach((p) => {
    pMap[p.name] = p;
  });

  // Helper date function
  const daysAgo = (d, hours = 10) => {
    const date = new Date();
    date.setDate(date.getDate() - d);
    date.setHours(hours, 0, 0, 0);
    return date;
  };

  // ==========================================
  // 4. SEED 8 CHECKOUT ORDERS & 20 SUBORDERS
  // ==========================================
  console.log('🛒 Creating 30-day realistic order network across consumers and farmers...');

  const orderDefinitions = [
    // -------------------------------------------------------------------------
    // Order 1 (28 days ago) - Consumer: Arjun Sharma (Hyderabad)
    // Multi-Farmer: Ramesh (Tomatoes, Potatoes) + Suresh (Organic Rice, Groundnuts) -> BOTH DELIVERED
    // -------------------------------------------------------------------------
    {
      orderNumber: 'ORD-2026-1001',
      consumer: consumer1,
      createdAt: daysAgo(28, 9),
      deliveryAddress: {
        fullName: 'Arjun Sharma',
        phone: '+91 99880 44444',
        street: 'Flat 402, Green Meadows, Banjara Hills Rd 12',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500034'
      },
      suborders: [
        {
          suborderNumber: 'SUB-1001-A',
          farmer: farmer1,
          items: [
            { product: pMap['Fresh Tomatoes'], qty: 3 },
            { product: pMap['Potatoes'], qty: 2 }
          ],
          paymentStatus: 'APPROVED_DEMO',
          fulfilmentStatus: 'DELIVERED',
          deliveryNote: 'Delivered directly to apartment security desk.',
          paymentProof: {
            ref: 'UPI-SBI-28491028',
            reviewedAt: daysAgo(28, 11),
            note: 'Payment screenshot verified.'
          }
        },
        {
          suborderNumber: 'SUB-1001-B',
          farmer: farmer2,
          items: [
            { product: pMap['Organic Rice'], qty: 10 },
            { product: pMap['Groundnuts'], qty: 2 }
          ],
          paymentStatus: 'APPROVED_DEMO',
          fulfilmentStatus: 'DELIVERED',
          deliveryNote: 'Dispatched via Warangal-Hyderabad farm van. Handed to customer.',
          paymentProof: {
            ref: 'UPI-HDFC-9912401',
            reviewedAt: daysAgo(28, 12),
            note: 'Verified demo payment receipt.'
          }
        }
      ]
    },

    // -------------------------------------------------------------------------
    // Order 2 (24 days ago) - Consumer: Priya Reddy (Warangal)
    // Multi-Farmer: Ramesh (Red Onions, Spinach) + Lakshmi (Papaya, Pomegranates) -> BOTH DELIVERED
    // -------------------------------------------------------------------------
    {
      orderNumber: 'ORD-2026-1002',
      consumer: consumer2,
      createdAt: daysAgo(24, 11),
      deliveryAddress: {
        fullName: 'Priya Reddy',
        phone: '+91 99890 55555',
        street: 'Plot 18, Kakatiya University Road, Subedari',
        city: 'Warangal',
        district: 'Warangal',
        state: 'Telangana',
        pincode: '506001'
      },
      suborders: [
        {
          suborderNumber: 'SUB-1002-A',
          farmer: farmer1,
          items: [
            { product: pMap['Red Onions'], qty: 5 },
            { product: pMap['Spinach'], qty: 3 }
          ],
          paymentStatus: 'APPROVED_DEMO',
          fulfilmentStatus: 'DELIVERED',
          deliveryNote: 'Delivered in eco-friendly jute bag.',
          paymentProof: {
            ref: 'UPI-ICICI-1102941',
            reviewedAt: daysAgo(24, 12),
            note: 'Approved for demonstration.'
          }
        },
        {
          suborderNumber: 'SUB-1002-B',
          farmer: farmer3,
          items: [
            { product: pMap['Papaya'], qty: 3 },
            { product: pMap['Pomegranates'], qty: 2 }
          ],
          paymentStatus: 'APPROVED_DEMO',
          fulfilmentStatus: 'DELIVERED',
          deliveryNote: 'Fresh organic fruit delivered in ventilated cardboard carton.',
          paymentProof: {
            ref: 'UPI-AXIS-4401923',
            reviewedAt: daysAgo(24, 13),
            note: 'Payment verified.'
          }
        }
      ]
    },

    // -------------------------------------------------------------------------
    // Order 3 (20 days ago) - Consumer: Rahul Verma (Karimnagar)
    // Multi-Farmer: Suresh (Wheat, Maize) + Lakshmi (Carrots, Cauliflower) -> BOTH DELIVERED
    // -------------------------------------------------------------------------
    {
      orderNumber: 'ORD-2026-1003',
      consumer: consumer3,
      createdAt: daysAgo(20, 14),
      deliveryAddress: {
        fullName: 'Rahul Verma',
        phone: '+91 99870 66666',
        street: 'House 8-3-112, Collectorate Lane, Court Chowrasta',
        city: 'Karimnagar',
        district: 'Karimnagar',
        state: 'Telangana',
        pincode: '505001'
      },
      suborders: [
        {
          suborderNumber: 'SUB-1003-A',
          farmer: farmer2,
          items: [
            { product: pMap['Wheat'], qty: 15 },
            { product: pMap['Maize'], qty: 5 }
          ],
          paymentStatus: 'APPROVED_DEMO',
          fulfilmentStatus: 'DELIVERED',
          deliveryNote: 'Grain sacks delivered in dry condition.',
          paymentProof: {
            ref: 'UPI-PAYTM-882910',
            reviewedAt: daysAgo(20, 15),
            note: 'Grains order payment cleared.'
          }
        },
        {
          suborderNumber: 'SUB-1003-B',
          farmer: farmer3,
          items: [
            { product: pMap['Carrots'], qty: 3 },
            { product: pMap['Cauliflower'], qty: 2 }
          ],
          paymentStatus: 'APPROVED_DEMO',
          fulfilmentStatus: 'DELIVERED',
          deliveryNote: 'Delivered crisp and fresh.',
          paymentProof: {
            ref: 'UPI-GPAY-772910',
            reviewedAt: daysAgo(20, 15),
            note: 'Verified.'
          }
        }
      ]
    },

    // -------------------------------------------------------------------------
    // Order 4 (15 days ago) - Consumer: Arjun Sharma (Hyderabad)
    // Multi-Farmer: Ramesh (Okra, Fresh Coriander) + Suresh (Turmeric, Red Gram) -> BOTH DELIVERED
    // -------------------------------------------------------------------------
    {
      orderNumber: 'ORD-2026-1004',
      consumer: consumer1,
      createdAt: daysAgo(15, 10),
      deliveryAddress: {
        fullName: 'Arjun Sharma',
        phone: '+91 99880 44444',
        street: 'Flat 402, Green Meadows, Banjara Hills Rd 12',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500034'
      },
      suborders: [
        {
          suborderNumber: 'SUB-1004-A',
          farmer: farmer1,
          items: [
            { product: pMap['Okra'], qty: 2 },
            { product: pMap['Fresh Coriander'], qty: 2 }
          ],
          paymentStatus: 'APPROVED_DEMO',
          fulfilmentStatus: 'DELIVERED',
          deliveryNote: 'Early morning vegetable drop.',
          paymentProof: {
            ref: 'UPI-SBI-330192',
            reviewedAt: daysAgo(15, 11),
            note: 'Approved.'
          }
        },
        {
          suborderNumber: 'SUB-1004-B',
          farmer: farmer2,
          items: [
            { product: pMap['Turmeric'], qty: 1 },
            { product: pMap['Red Gram'], qty: 3 }
          ],
          paymentStatus: 'APPROVED_DEMO',
          fulfilmentStatus: 'DELIVERED',
          deliveryNote: 'Delivered safely.',
          paymentProof: {
            ref: 'UPI-HDFC-551029',
            reviewedAt: daysAgo(15, 12),
            note: 'Approved.'
          }
        }
      ]
    },

    // -------------------------------------------------------------------------
    // Order 5 (10 days ago) - Consumer: Priya Reddy (Warangal)
    // Multi-Farmer: Suresh (Green Gram) [DELIVERED] + Lakshmi (Fresh Mangoes, Bananas) [DELIVERED]
    // -------------------------------------------------------------------------
    {
      orderNumber: 'ORD-2026-1005',
      consumer: consumer2,
      createdAt: daysAgo(10, 12),
      deliveryAddress: {
        fullName: 'Priya Reddy',
        phone: '+91 99890 55555',
        street: 'Plot 18, Kakatiya University Road, Subedari',
        city: 'Warangal',
        district: 'Warangal',
        state: 'Telangana',
        pincode: '506001'
      },
      suborders: [
        {
          suborderNumber: 'SUB-1005-A',
          farmer: farmer2,
          items: [{ product: pMap['Green Gram'], qty: 3 }],
          paymentStatus: 'APPROVED_DEMO',
          fulfilmentStatus: 'DELIVERED',
          deliveryNote: 'Delivered.',
          paymentProof: {
            ref: 'UPI-ICICI-662910',
            reviewedAt: daysAgo(10, 13),
            note: 'Approved.'
          }
        },
        {
          suborderNumber: 'SUB-1005-B',
          farmer: farmer3,
          items: [
            { product: pMap['Fresh Mangoes'], qty: 4 },
            { product: pMap['Bananas'], qty: 2 }
          ],
          paymentStatus: 'APPROVED_DEMO',
          fulfilmentStatus: 'DELIVERED',
          deliveryNote: 'Delivered fresh fruit basket.',
          paymentProof: {
            ref: 'UPI-AXIS-992019',
            reviewedAt: daysAgo(10, 14),
            note: 'Approved.'
          }
        }
      ]
    },

    // -------------------------------------------------------------------------
    // Order 6 (5 days ago) - Consumer: Rahul Verma (Karimnagar)
    // Multi-Farmer: Ramesh (Green Chillies, Brinjal) [PROCESSING] + Lakshmi (Sweet Corn, Cabbage) [DISPATCHED]
    // -------------------------------------------------------------------------
    {
      orderNumber: 'ORD-2026-1006',
      consumer: consumer3,
      createdAt: daysAgo(5, 15),
      deliveryAddress: {
        fullName: 'Rahul Verma',
        phone: '+91 99870 66666',
        street: 'House 8-3-112, Collectorate Lane, Court Chowrasta',
        city: 'Karimnagar',
        district: 'Karimnagar',
        state: 'Telangana',
        pincode: '505001'
      },
      suborders: [
        {
          suborderNumber: 'SUB-1006-A',
          farmer: farmer1,
          items: [
            { product: pMap['Green Chillies'], qty: 1 },
            { product: pMap['Brinjal'], qty: 2 }
          ],
          paymentStatus: 'APPROVED_DEMO',
          fulfilmentStatus: 'PROCESSING',
          deliveryNote: '',
          paymentProof: {
            ref: 'UPI-PAYTM-441029',
            reviewedAt: daysAgo(5, 16),
            note: 'Payment verified. Harvesting fresh stock for dispatch.'
          }
        },
        {
          suborderNumber: 'SUB-1006-B',
          farmer: farmer3,
          items: [
            { product: pMap['Sweet Corn'], qty: 4 },
            { product: pMap['Cabbage'], qty: 2 }
          ],
          paymentStatus: 'APPROVED_DEMO',
          fulfilmentStatus: 'DISPATCHED',
          deliveryNote: 'Dispatched via local delivery auto. Expected delivery this afternoon.',
          paymentProof: {
            ref: 'UPI-GPAY-992812',
            reviewedAt: daysAgo(5, 16),
            note: 'Screenshot accepted.'
          }
        }
      ]
    },

    // -------------------------------------------------------------------------
    // Order 7 (2 days ago) - Consumer: Arjun Sharma (Hyderabad)
    // Multi-Farmer: Ramesh (Fresh Tomatoes) [PROOF_SUBMITTED] + Suresh (Organic Tomatoes) [READY_FOR_DISPATCH]
    // -------------------------------------------------------------------------
    {
      orderNumber: 'ORD-2026-1007',
      consumer: consumer1,
      createdAt: daysAgo(2, 16),
      deliveryAddress: {
        fullName: 'Arjun Sharma',
        phone: '+91 99880 44444',
        street: 'Flat 402, Green Meadows, Banjara Hills Rd 12',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500034'
      },
      suborders: [
        {
          suborderNumber: 'SUB-1007-A',
          farmer: farmer1,
          items: [{ product: pMap['Fresh Tomatoes'], qty: 4 }],
          paymentStatus: 'PROOF_SUBMITTED',
          fulfilmentStatus: 'PLACED',
          deliveryNote: '',
          paymentProof: {
            ref: 'UPI-SBI-881920',
            reviewedAt: null,
            note: ''
          }
        },
        {
          suborderNumber: 'SUB-1007-B',
          farmer: farmer2,
          items: [{ product: pMap['Organic Tomatoes'], qty: 3 }],
          paymentStatus: 'APPROVED_DEMO',
          fulfilmentStatus: 'READY_FOR_DISPATCH',
          deliveryNote: 'Packed in wooden crate, awaiting transport van.',
          paymentProof: {
            ref: 'UPI-HDFC-112940',
            reviewedAt: daysAgo(2, 17),
            note: 'Verified demo payment.'
          }
        }
      ]
    },

    // -------------------------------------------------------------------------
    // Order 8 (Today) - Consumer: Priya Reddy (Warangal)
    // Multi-Farmer: Suresh (Wheat) [PENDING_PAYMENT] + Lakshmi (Fresh Mangoes) [PROOF_SUBMITTED]
    // -------------------------------------------------------------------------
    {
      orderNumber: 'ORD-2026-1008',
      consumer: consumer2,
      createdAt: daysAgo(0, 9),
      deliveryAddress: {
        fullName: 'Priya Reddy',
        phone: '+91 99890 55555',
        street: 'Plot 18, Kakatiya University Road, Subedari',
        city: 'Warangal',
        district: 'Warangal',
        state: 'Telangana',
        pincode: '506001'
      },
      suborders: [
        {
          suborderNumber: 'SUB-1008-A',
          farmer: farmer2,
          items: [{ product: pMap['Wheat'], qty: 10 }],
          paymentStatus: 'PENDING_PAYMENT',
          fulfilmentStatus: 'PLACED',
          deliveryNote: '',
          paymentProof: null
        },
        {
          suborderNumber: 'SUB-1008-B',
          farmer: farmer3,
          items: [{ product: pMap['Fresh Mangoes'], qty: 2 }],
          paymentStatus: 'PROOF_SUBMITTED',
          fulfilmentStatus: 'PLACED',
          deliveryNote: '',
          paymentProof: {
            ref: 'UPI-AXIS-992810',
            reviewedAt: null,
            note: ''
          }
        }
      ]
    }
  ];

  let totalSubordersCreated = 0;

  for (const oDef of orderDefinitions) {
    let grandTotal = 0;
    const suborderIds = [];

    // Master Checkout Instance
    const checkout = new CheckoutOrder({
      orderNumber: oDef.orderNumber,
      consumerId: oDef.consumer._id,
      deliveryAddress: oDef.deliveryAddress,
      deliveryMethod: 'delivery',
      grandTotal: 0,
      suborders: [],
      createdAt: oDef.createdAt,
      updatedAt: oDef.createdAt
    });

    for (const sDef of oDef.suborders) {
      const itemsList = sDef.items.map((it) => {
        const itemSubtotal = it.product.pricePerUnit * it.qty;
        return {
          productId: it.product._id,
          name: it.product.name,
          price: it.product.pricePerUnit,
          unit: it.product.unit,
          quantity: it.qty,
          subtotal: itemSubtotal,
          imageSnapshot: it.product.images[0] || ''
        };
      });

      const subtotal = itemsList.reduce((sum, it) => sum + it.subtotal, 0);
      grandTotal += subtotal;

      const suborder = await FarmerSuborder.create({
        suborderNumber: sDef.suborderNumber,
        parentOrderId: checkout._id,
        farmerId: sDef.farmer._id,
        consumerId: oDef.consumer._id,
        items: itemsList,
        subtotal,
        paymentStatus: sDef.paymentStatus,
        fulfilmentStatus: sDef.fulfilmentStatus,
        deliveryNote: sDef.deliveryNote || '',
        createdAt: oDef.createdAt,
        updatedAt: oDef.createdAt,
        statusHistory: [
          {
            status: 'PLACED',
            timestamp: oDef.createdAt,
            note: 'Order placed by consumer.',
            changedBy: oDef.consumer._id
          },
          ...(sDef.paymentStatus === 'APPROVED_DEMO'
            ? [
                {
                  status: 'APPROVED_DEMO',
                  timestamp: sDef.paymentProof?.reviewedAt || oDef.createdAt,
                  note: 'Farmer verified demo payment.',
                  changedBy: sDef.farmer._id
                }
              ]
            : []),
          ...(sDef.fulfilmentStatus === 'DELIVERED'
            ? [
                {
                  status: 'DELIVERED',
                  timestamp: new Date(oDef.createdAt.getTime() + 2 * 24 * 60 * 60 * 1000),
                  note: sDef.deliveryNote || 'Delivered to buyer.',
                  changedBy: sDef.farmer._id
                }
              ]
            : [])
        ]
      });

      suborderIds.push(suborder._id);
      totalSubordersCreated++;

      // Create Payment Proof Record if applicable
      if (sDef.paymentProof) {
        await PaymentProof.create({
          suborderId: suborder._id,
          farmerId: sDef.farmer._id,
          consumerId: oDef.consumer._id,
          screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop',
          paymentReference: sDef.paymentProof.ref,
          paymentMethod: 'DEMO_UPI',
          status: sDef.paymentProof.reviewedAt ? 'APPROVED_DEMO' : 'SUBMITTED',
          reviewNote: sDef.paymentProof.note || '',
          reviewedAt: sDef.paymentProof.reviewedAt,
          reviewedBy: sDef.paymentProof.reviewedAt ? sDef.farmer._id : null,
          createdAt: oDef.createdAt
        });
      }
    }

    checkout.grandTotal = grandTotal;
    checkout.suborders = suborderIds;
    await checkout.save();
  }

  console.log(`✅ Created ${orderDefinitions.length} master checkouts and ${totalSubordersCreated} farmer suborders.`);

  // ==========================================
  // 5. SEED CULTIVATION EXPENSES
  // ==========================================
  console.log('💰 Seeding cultivation expenses for realistic P&L analytics...');

  const expenses = [
    // Farmer 1: Ramesh Kumar (Total: ₹18,100)
    {
      farmerId: farmer1._id,
      category: 'Seeds',
      amount: 3500,
      date: daysAgo(29),
      cropName: 'Fresh Tomatoes & Potatoes',
      description: 'Disease-resistant certified seeds from National Seeds Corp.'
    },
    {
      farmerId: farmer1._id,
      category: 'Fertilizers',
      amount: 4200,
      date: daysAgo(22),
      cropName: 'Red Onions & Spinach',
      description: 'Organic compost manure and bio-potash.'
    },
    {
      farmerId: farmer1._id,
      category: 'Irrigation',
      amount: 2100,
      date: daysAgo(16),
      cropName: 'All Vegetables',
      description: 'Drip line lateral replacement and sub-main filter maintenance.'
    },
    {
      farmerId: farmer1._id,
      category: 'Labour',
      amount: 6500,
      date: daysAgo(8),
      cropName: 'Fresh Tomatoes & Okra',
      description: 'Weeding, staking, harvesting, and sorting charges.'
    },
    {
      farmerId: farmer1._id,
      category: 'Transport',
      amount: 1800,
      date: daysAgo(3),
      cropName: 'Vegetable Dispatch',
      description: 'Local farm pickup van fuel and crate transit.'
    },

    // Farmer 2: Suresh Reddy (Total: ₹26,700)
    {
      farmerId: farmer2._id,
      category: 'Seeds',
      amount: 5000,
      date: daysAgo(30),
      cropName: 'Organic Rice (Sona Masoori)',
      description: 'Native seed paddy selection.'
    },
    {
      farmerId: farmer2._id,
      category: 'Fertilizers',
      amount: 6000,
      date: daysAgo(25),
      cropName: 'Wheat & Rice',
      description: 'Bulk farmyard manure and neem cake.'
    },
    {
      farmerId: farmer2._id,
      category: 'Irrigation',
      amount: 2500,
      date: daysAgo(18),
      cropName: 'All Grains',
      description: 'Solar borehole pump servicing.'
    },
    {
      farmerId: farmer2._id,
      category: 'Equipment',
      amount: 7000,
      date: daysAgo(12),
      cropName: 'Paddy Harvesting',
      description: 'Combine thresher rental and grain cleaner.'
    },
    {
      farmerId: farmer2._id,
      category: 'Packaging',
      amount: 3200,
      date: daysAgo(6),
      cropName: 'Rice & Wheat',
      description: 'Cotton breathable eco-packaging bags.'
    },
    {
      farmerId: farmer2._id,
      category: 'Labour',
      amount: 3000,
      date: daysAgo(2),
      cropName: 'Groundnuts',
      description: 'Threshing and manual sorting labour.'
    },

    // Farmer 3: Lakshmi Devi (Total: ₹14,800)
    {
      farmerId: farmer3._id,
      category: 'Organic Treatments',
      amount: 4500,
      date: daysAgo(27),
      cropName: 'Fresh Mangoes & Papaya',
      description: 'Panchagavya organic spray and fruit fly traps.'
    },
    {
      farmerId: farmer3._id,
      category: 'Irrigation',
      amount: 2000,
      date: daysAgo(19),
      cropName: 'Fruit Orchards',
      description: 'Manair canal intake canal desilting.'
    },
    {
      farmerId: farmer3._id,
      category: 'Labour',
      amount: 5500,
      date: daysAgo(11),
      cropName: 'Mangoes & Bananas',
      description: 'Hand-harvesting fruit, bunch-bagging, and crate loading.'
    },
    {
      farmerId: farmer3._id,
      category: 'Packaging',
      amount: 2800,
      date: daysAgo(4),
      cropName: 'Pomegranates & Sweet Corn',
      description: 'Ventilated fruit boxes and protective sleeves.'
    }
  ];

  await CultivationExpense.create(expenses);
  console.log(`✅ Created ${expenses.length} cultivation expense entries.`);

  // ==========================================
  // 6. SEED NOTIFICATIONS
  // ==========================================
  console.log('🔔 Generating contextual in-app notifications for all characters...');

  const notifications = [
    // Farmer 1 notifications
    {
      userId: farmer1._id,
      title: 'Payment Proof Received!',
      message: 'Arjun Sharma uploaded payment screenshot for order #SUB-1007-A (₹140). Please review.',
      type: 'payment',
      link: '/farmer/orders',
      isRead: false,
      createdAt: daysAgo(2)
    },
    {
      userId: farmer1._id,
      title: 'Order Delivered Successfully',
      message: 'Suborder #SUB-1004-A has been marked as DELIVERED.',
      type: 'delivery',
      link: '/farmer/orders',
      isRead: true,
      createdAt: daysAgo(13)
    },
    // Farmer 2 notifications
    {
      userId: farmer2._id,
      title: 'New Produce Order Received',
      message: 'Priya Reddy placed order #SUB-1008-A for 10 kg Wheat (₹450).',
      type: 'order',
      link: '/farmer/orders',
      isRead: false,
      createdAt: daysAgo(0)
    },
    // Farmer 3 notifications
    {
      userId: farmer3._id,
      title: 'Payment Proof Received!',
      message: 'Priya Reddy submitted payment screenshot for order #SUB-1008-B (₹320). Please review.',
      type: 'payment',
      link: '/farmer/orders',
      isRead: false,
      createdAt: daysAgo(0)
    },
    // Consumer 1 notifications
    {
      userId: consumer1._id,
      title: 'Demo Payment Approved!',
      message: 'Suresh Reddy approved your demo payment for Organic Tomatoes. Order is being packed.',
      type: 'payment',
      link: '/consumer/orders',
      isRead: false,
      createdAt: daysAgo(2)
    },
    // Consumer 2 notifications
    {
      userId: consumer2._id,
      title: 'Order Dispatched!',
      message: 'Lakshmi Devi dispatched your sweet corn and cabbage order #SUB-1006-B.',
      type: 'delivery',
      link: '/consumer/orders',
      isRead: false,
      createdAt: daysAgo(5)
    }
  ];

  await Notification.create(notifications);
  console.log(`✅ Generated ${notifications.length} in-app notifications.`);

  // ==========================================
  // FINAL SUMMARY REPORT
  // ==========================================
  console.log('\n=============================================================');
  console.log('🎉 DATABASE RESET & RELATIONAL DEMO SEEDING COMPLETED!');
  console.log('=============================================================');
  console.log('👥 EXACT 7 USERS CREATED:');
  console.log('   1. Main Admin:     admin@gmail.com       / Admin@12345    (Role: admin)');
  console.log('   2. Ramesh Kumar:   user1@gmail.com       / Farmer@12345   (Role: farmer)');
  console.log('   3. Suresh Reddy:   user2@gmail.com       / Farmer@12345   (Role: farmer)');
  console.log('   4. Lakshmi Devi:   user3@gmail.com       / Farmer@12345   (Role: farmer)');
  console.log('   5. Arjun Sharma:   consumer1@gmail.com   / Consumer@12345 (Role: consumer)');
  console.log('   6. Priya Reddy:    consumer2@gmail.com   / Consumer@12345 (Role: consumer)');
  console.log('   7. Rahul Verma:    consumer3@gmail.com   / Consumer@12345 (Role: consumer)');
  console.log('-------------------------------------------------------------');
  console.log(`📦 PRODUCTS:      ${createdProducts.length} (8 per farmer)`);
  console.log(`🛒 CHECKOUTS:     ${orderDefinitions.length} master checkouts`);
  console.log(`📋 SUBORDERS:     ${totalSubordersCreated} farmer suborders across all stages`);
  console.log(`💰 EXPENSES:      ${expenses.length} cultivation expense entries`);
  console.log(`🔔 NOTIFICATIONS: ${notifications.length} contextual alerts`);
  console.log('=============================================================\n');

  process.exit(0);
}

runResetAndSeed().catch((err) => {
  console.error('❌ Error during database reset and seed:', err);
  process.exit(1);
});

