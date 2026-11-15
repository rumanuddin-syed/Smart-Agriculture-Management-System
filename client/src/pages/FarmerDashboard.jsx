import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  Plus,
  Store,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const FarmerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/marketplace/farmer/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching farmer dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-emerald"></div>
      </div>
    );
  }

  const { overview, financials, lowStockAlerts, topProducts, recentOrders } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-agri-emerald bg-emerald-50 px-3 py-1 rounded-full">
            Farmer Business Suite
          </span>
          <h1 className="text-3xl font-extrabold text-agri-forest mt-2">
            Producer Command Center
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Real-time harvest inventory, demo sales, fulfillment actions, and profit/loss analytics.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/farmer/products/new" className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Add New Produce</span>
          </Link>
          <Link to="/farmer/expenses" className="btn-outline text-xs py-2.5 px-4">
            Log Expense
          </Link>
        </div>
      </div>

      {/* Financial Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="card p-5 border-l-4 border-l-agri-emerald">
          <span className="text-xs font-bold text-gray-500 uppercase">Recognized Sales (Delivered)</span>
          <div className="text-2xl font-black text-agri-forest mt-1">₹{financials?.recognizedSales}</div>
          <span className="text-[11px] text-gray-400 mt-1 block">Completed orders fulfilled</span>
        </div>

        <div className="card p-5 border-l-4 border-l-amber-500">
          <span className="text-xs font-bold text-gray-500 uppercase">Pending Demo Orders</span>
          <div className="text-2xl font-black text-amber-600 mt-1">₹{financials?.pendingSales}</div>
          <span className="text-[11px] text-gray-400 mt-1 block">Under review or in transit</span>
        </div>

        <div className="card p-5 border-l-4 border-l-red-500">
          <span className="text-xs font-bold text-gray-500 uppercase">Cultivation Expenses</span>
          <div className="text-2xl font-black text-red-600 mt-1">₹{financials?.totalExpenses}</div>
          <span className="text-[11px] text-gray-400 mt-1 block">Seeds, fertilizers, labour, etc.</span>
        </div>

        <div className="card p-5 border-l-4 border-l-purple-600">
          <span className="text-xs font-bold text-gray-500 uppercase">Estimated Net Profit</span>
          <div className={`text-2xl font-black mt-1 ${financials?.estimatedNetProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            ₹{financials?.estimatedNetProfit}
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Profit Margin: <strong>{financials?.profitMargin}%</strong>
          </span>
        </div>
      </div>

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
          <span className="text-xs text-gray-500 block">Active Listings</span>
          <span className="text-xl font-bold text-agri-forest">{overview?.activeListings}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
          <span className="text-xs text-gray-500 block">Units Sold</span>
          <span className="text-xl font-bold text-agri-emerald">{financials?.totalUnitsSold}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
          <span className="text-xs text-gray-500 block">Proof Awaiting Review</span>
          <span className="text-xl font-bold text-amber-600">{overview?.proofSubmittedCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
          <span className="text-xs text-gray-500 block">In Preparation</span>
          <span className="text-xl font-bold text-purple-600">{overview?.acceptedCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
          <span className="text-xs text-gray-500 block">Dispatched</span>
          <span className="text-xl font-bold text-blue-600">{overview?.dispatchedCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
          <span className="text-xs text-gray-500 block">Delivered</span>
          <span className="text-xl font-bold text-green-700">{overview?.deliveredCount}</span>
        </div>
      </div>

      {/* Low Stock Warnings */}
      {lowStockAlerts && lowStockAlerts.length > 0 && (
        <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="font-bold text-sm text-amber-900">Low Stock Inventory Alerts ({lowStockAlerts.length})</h3>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStockAlerts.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-xl border border-amber-200 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-agri-forest">{item.name}</span>
                  <span className="text-gray-500 block">₹{item.pricePerUnit} / {item.unit}</span>
                </div>
                <span className="font-black text-amber-600 bg-amber-100 px-2 py-1 rounded">
                  Only {item.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation shortcuts */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Link to="/farmer/products" className="card p-6 hover:border-agri-emerald transition-all group block">
          <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center text-agri-emerald mb-3 group-hover:bg-agri-emerald group-hover:text-white transition-colors">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-base text-agri-forest mb-1">Product Inventory</h3>
          <p className="text-xs text-gray-500">Add, edit prices, update stock levels, or toggle active listings.</p>
        </Link>

        <Link to="/farmer/orders" className="card p-6 hover:border-agri-emerald transition-all group block">
          <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center text-agri-emerald mb-3 group-hover:bg-agri-emerald group-hover:text-white transition-colors">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-base text-agri-forest mb-1">Orders & Payment Review</h3>
          <p className="text-xs text-gray-500">Inspect consumer payment screenshots, approve demo payments, and dispatch items.</p>
        </Link>

        <Link to="/farmer/profit-loss" className="card p-6 hover:border-agri-emerald transition-all group block">
          <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center text-agri-emerald mb-3 group-hover:bg-agri-emerald group-hover:text-white transition-colors">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-base text-agri-forest mb-1">Profit & Loss Reports</h3>
          <p className="text-xs text-gray-500">Calculate net farm profit by tracking cultivation costs against sales.</p>
        </Link>
      </div>
    </div>
  );
};

export default FarmerDashboard;

