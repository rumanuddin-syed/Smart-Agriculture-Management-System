const CultivationExpense = require('../models/CultivationExpense');
const FarmerSuborder = require('../models/FarmerSuborder');
const Product = require('../models/Product');

// Add Expense
exports.createExpense = async (req, res) => {
  try {
    const { category, amount, date, cropName, description } = req.body;

    if (!category || amount === undefined) {
      return res.status(400).json({ message: 'Category and amount are required.' });
    }

    const receiptUrl = req.file ? `/uploads/products/${req.file.filename}` : '';

    const expense = await CultivationExpense.create({
      farmerId: req.user.id,
      category,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      cropName: cropName || '',
      description: description || '',
      receiptUrl
    });

    res.status(201).json({ message: 'Expense logged successfully!', expense });
  } catch (err) {
    console.error('createExpense error:', err);
    res.status(500).json({ message: err.message || 'Error logging expense.' });
  }
};

// Get Farmer Expenses (with filters)
exports.getExpenses = async (req, res) => {
  try {
    const { category, cropName, startDate, endDate } = req.query;
    const filter = { farmerId: req.user.id };

    if (category && category !== 'All') filter.category = category;
    if (cropName) filter.cropName = { $regex: cropName, $options: 'i' };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await CultivationExpense.find(filter).sort({ date: -1 });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Grouping by category
    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    res.json({
      totalCount: expenses.length,
      totalExpenses,
      categoryTotals,
      expenses
    });
  } catch (err) {
    console.error('getExpenses error:', err);
    res.status(500).json({ message: 'Error retrieving expenses.' });
  }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await CultivationExpense.findOneAndDelete({ _id: id, farmerId: req.user.id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense record not found or unauthorized.' });
    }
    res.json({ message: 'Expense record deleted successfully.' });
  } catch (err) {
    console.error('deleteExpense error:', err);
    res.status(500).json({ message: 'Error deleting expense.' });
  }
};

// Farmer Sales Analytics & Overview Dashboard
exports.getFarmerDashboardAnalytics = async (req, res) => {
  try {
    const farmerId = req.user.id;

    // 1. Inventory & Products
    const products = await Product.find({ farmerId });
    const totalProducts = products.length;
    const activeListings = products.filter((p) => p.status === 'active' && p.stock > 0).length;
    const lowStockAlerts = products.filter((p) => p.stock > 0 && p.stock <= 10);
    const totalStockAvailable = products.reduce((sum, p) => sum + p.stock, 0);

    // 2. Suborders Analysis
    const allSuborders = await FarmerSuborder.find({ farmerId });
    const totalSuborders = allSuborders.length;

    const pendingPaymentCount = allSuborders.filter((s) => s.paymentStatus === 'PENDING_PAYMENT').length;
    const proofSubmittedCount = allSuborders.filter((s) => s.paymentStatus === 'PROOF_SUBMITTED').length;
    const acceptedCount = allSuborders.filter((s) => s.fulfilmentStatus === 'ACCEPTED' || s.fulfilmentStatus === 'PROCESSING').length;
    const dispatchedCount = allSuborders.filter((s) => s.fulfilmentStatus === 'DISPATCHED' || s.fulfilmentStatus === 'READY_FOR_DISPATCH').length;
    const deliveredCount = allSuborders.filter((s) => s.fulfilmentStatus === 'DELIVERED').length;
    const cancelledCount = allSuborders.filter((s) => s.fulfilmentStatus === 'CANCELLED' || s.fulfilmentStatus === 'REJECTED_BY_FARMER').length;

    // 3. Financial Metrics (Strict Separation of Recognized vs Pending)
    let recognizedSales = 0; // Completed/Delivered orders
    let pendingSales = 0;    // Approved demo payment or in processing/dispatched
    let grossTotalOrderValue = 0;
    let totalUnitsSold = 0;

    const productSalesMap = {};

    allSuborders.forEach((s) => {
      // Exclude cancelled/rejected orders from revenue calculation
      if (['CANCELLED', 'REJECTED_BY_FARMER'].includes(s.fulfilmentStatus)) {
        return;
      }

      grossTotalOrderValue += s.subtotal;

      if (s.fulfilmentStatus === 'DELIVERED') {
        recognizedSales += s.subtotal;
      } else if (['APPROVED_DEMO', 'PROOF_SUBMITTED'].includes(s.paymentStatus)) {
        pendingSales += s.subtotal;
      }

      s.items.forEach((item) => {
        totalUnitsSold += item.quantity;
        const name = item.name;
        if (!productSalesMap[name]) {
          productSalesMap[name] = { name, quantitySold: 0, revenue: 0 };
        }
        productSalesMap[name].quantitySold += item.quantity;
        productSalesMap[name].revenue += item.subtotal;
      });
    });

    // 4. Cultivation Expenses
    const expenses = await CultivationExpense.find({ farmerId });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // 5. Profit & Loss Computation
    // Net Profit based on Recognized Sales vs Recorded Expenses
    const estimatedNetProfit = recognizedSales - totalExpenses;
    const profitMargin = recognizedSales > 0 ? ((estimatedNetProfit / recognizedSales) * 100).toFixed(1) : 0;

    // Best sellers
    const topProducts = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    res.json({
      overview: {
        totalProducts,
        activeListings,
        lowStockAlertsCount: lowStockAlerts.length,
        totalStockAvailable,
        totalSuborders,
        pendingPaymentCount,
        proofSubmittedCount,
        acceptedCount,
        dispatchedCount,
        deliveredCount,
        cancelledCount
      },
      lowStockAlerts: lowStockAlerts.map((p) => ({
        id: p._id,
        name: p.name,
        stock: p.stock,
        unit: p.unit,
        pricePerUnit: p.pricePerUnit
      })),
      financials: {
        recognizedSales,
        pendingSales,
        grossTotalOrderValue,
        totalUnitsSold,
        totalExpenses,
        estimatedNetProfit,
        profitMargin: Number(profitMargin),
        accountingPolicy: 'Recognized Sales calculated strictly from DELIVERED suborders. Pending orders shown separately.'
      },
      topProducts,
      recentOrders: allSuborders.slice(0, 5)
    });
  } catch (err) {
    console.error('getFarmerDashboardAnalytics error:', err);
    res.status(500).json({ message: 'Error compiling farmer analytics.' });
  }
};

