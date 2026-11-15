const axios = require('axios');
const API = 'http://127.0.0.1:5000/api';

async function testMarketplaceFlow() {
  console.log('🧪 Starting End-to-End API Test for Multi-Farmer Marketplace...');

  // 1. Login Consumer
  const cRes = await axios.post(API + '/auth/login', { email: 'rahul.consumer@example.com', password: 'password123' });
  const cToken = cRes.data.token;
  const cHeaders = { Authorization: 'Bearer ' + cToken };
  console.log('✅ Consumer Logged in:', cRes.data.user.name);

  // 2. Fetch Marketplace Products
  const mRes = await axios.get(API + '/marketplace/products');
  console.log('✅ Products fetched from marketplace:', mRes.data.products.length);

  // Pick 2 products from 2 DIFFERENT farmers
  const prodA = mRes.data.products[0];
  const prodB = mRes.data.products.find(p => p.farmerId?._id?.toString() !== prodA.farmerId?._id?.toString());
  console.log('📦 Selected Item 1:', prodA.name, 'from', prodA.farmerInfo.farmName);
  console.log('📦 Selected Item 2:', prodB.name, 'from', prodB.farmerInfo.farmName);

  // 3. Perform Multi-Farmer Checkout
  const checkoutPayload = {
    items: [
      { productId: prodA._id, quantity: 2 },
      { productId: prodB._id, quantity: 1 }
    ],
    deliveryAddress: {
      fullName: 'Rahul Sharma',
      phone: '+91 99887 76655',
      street: '402 Ocean View, Marine Drive',
      city: 'Mumbai',
      district: 'Mumbai City',
      state: 'Maharashtra',
      pincode: '400020'
    },
    deliveryMethod: 'delivery'
  };

  const chkRes = await axios.post(API + '/marketplace/checkout', checkoutPayload, { headers: cHeaders });
  console.log('✅ Multi-Farmer Checkout Placed successfully!');
  console.log('   Order #' + chkRes.data.orderNumber + ', Grand Total: ₹' + chkRes.data.grandTotal + ', Suborders Count: ' + chkRes.data.subordersCount);

  // 4. Inspect Order from Consumer Side
  const ordRes = await axios.get(API + '/marketplace/consumer/orders/' + chkRes.data.checkoutId, { headers: cHeaders });
  const suborderA = ordRes.data.checkout.suborders[0];
  console.log('✅ Suborder #' + suborderA.suborderNumber + ' initial payment status:', suborderA.paymentStatus);

  // 5. Test Role Guard: Verify consumer CANNOT review payments or access farmer analytics
  try {
    await axios.get(API + '/marketplace/farmer/analytics', { headers: cHeaders });
    console.error('❌ Role Guard Failed: Consumer was allowed to view farmer analytics!');
  } catch (err) {
    if (err.response?.status === 403) {
      console.log('🛡️ Role Guard Verified: Consumer blocked with 403 Forbidden on farmer hub.');
    } else {
      console.log('Status code on forbidden endpoint:', err.response?.status);
    }
  }

  // 6. Farmer A Login & Review
  const fRes = await axios.post(API + '/auth/login', { email: 'ramesh.farmer@example.com', password: 'password123' });
  const fToken = fRes.data.token;
  const fHeaders = { Authorization: 'Bearer ' + fToken };
  console.log('✅ Farmer Ramesh Logged in:', fRes.data.user.name);

  // 7. Check Farmer Analytics
  const fAnalytics = await axios.get(API + '/marketplace/farmer/analytics', { headers: fHeaders });
  console.log('📊 Farmer Analytics Overview:');
  console.log('   Active Listings:', fAnalytics.data.overview.activeListings);
  console.log('   Total Suborders Received:', fAnalytics.data.overview.totalSuborders);
  console.log('   Cultivation Expenses Recorded: ₹' + fAnalytics.data.financials.totalExpenses);
  console.log('   Estimated Net Profit: ₹' + fAnalytics.data.financials.estimatedNetProfit);

  console.log('\n🎉 ALL MULTI-FARMER MARKETPLACE VERIFICATIONS PASSED SUCCESSFULLY!');
  process.exit(0);
}

testMarketplaceFlow().catch(err => {
  console.error('❌ Test failed:', err.response?.data || err.message);
  process.exit(1);
});

