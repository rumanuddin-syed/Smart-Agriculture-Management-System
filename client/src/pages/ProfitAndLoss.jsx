import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, PieChart, FileText, Download } from 'lucide-react';

const ProfitAndLoss = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/marketplace/farmer/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching P&L data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value (INR)'],
      ['Recognized Sales (Delivered)', data.financials?.recognizedSales || 0],
      ['Pending Order Value', data.financials?.pendingSales || 0],
      ['Total Cultivation Expenses', data.financials?.totalExpenses || 0],
      ['Estimated Net Profit', data.financials?.estimatedNetProfit || 0],
      ['Profit Margin (%)', `${data.financials?.profitMargin || 0}%`]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'farmer_profit_and_loss_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-emerald"></div>
      </div>
    );
  }

  const { financials, topProducts } = data || {};
  const isProfitable = (financials?.estimatedNetProfit || 0) >= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-agri-forest">Profit & Loss Statement</h1>
          <p className="text-sm text-gray-600 mt-1">
            Accounting ledger reflecting recognized sales against recorded input cultivation expenses.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="btn-outline text-xs py-2 px-4 flex items-center gap-1.5"
        >
          <Download className="h-4 w-4" />
          <span>Export P&L CSV</span>
        </button>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="card p-6 bg-white border border-emerald-100">
          <span className="text-xs font-bold text-gray-500 uppercase">Recognized Sales Revenue</span>
          <div className="text-3xl font-black text-agri-forest mt-2">
            ₹{financials?.recognizedSales}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Strictly computed from DELIVERED customer orders.
          </p>
        </div>

        <div className="card p-6 bg-white border border-emerald-100">
          <span className="text-xs font-bold text-gray-500 uppercase">Total Cultivation Expenses</span>
          <div className="text-3xl font-black text-red-600 mt-2">
            ₹{financials?.totalExpenses}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Seeds, fertilizers, irrigation, labour, transport, etc.
          </p>
        </div>

        <div className={`card p-6 bg-white border ${isProfitable ? 'border-emerald-300 bg-emerald-50/20' : 'border-red-300 bg-red-50/20'}`}>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500 uppercase">Estimated Net Profit</span>
            {isProfitable ? (
              <ArrowUpRight className="h-5 w-5 text-emerald-600" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-600" />
            )}
          </div>
          <div className={`text-3xl font-black mt-2 ${isProfitable ? 'text-emerald-700' : 'text-red-600'}`}>
            ₹{financials?.estimatedNetProfit}
          </div>
          <p className="text-xs text-gray-600 mt-2 font-semibold">
            Profit Margin: <span className="font-bold">{financials?.profitMargin}%</span>
          </p>
        </div>
      </div>

      {/* Accounting Policy Explainer Banner */}
      <div className="card p-6 border-l-4 border-l-agri-emerald mb-10 bg-agri-light/40">
        <h4 className="font-bold text-sm text-agri-forest mb-1">Recognized Revenue Accounting Policy</h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          {financials?.accountingPolicy ||
            'Recognized Sales calculated strictly from DELIVERED suborders. Pending orders shown separately.'}
          <br />
          <strong>Demo Notice:</strong> Payment screenshot approvals represent simulated settlement for college demonstration purposes and do not constitute external bank fund transfers.
        </p>
      </div>

      {/* Revenue Breakdown by Best-Selling Crops */}
      <div className="card p-6 border border-emerald-100">
        <h3 className="text-base font-bold text-agri-forest mb-4">
          Crop-Wise Performance & Revenue
        </h3>

        {topProducts && topProducts.length > 0 ? (
          <div className="divide-y divide-gray-100 text-xs">
            {topProducts.map((p, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center">
                <div>
                  <span className="font-bold text-agri-forest text-sm block">{p.name}</span>
                  <span className="text-gray-500">Total Units Sold: {p.quantitySold}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-agri-forest block">₹{p.revenue}</span>
                  <span className="text-[10px] text-gray-400">Total Produce Sales</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No crop sales transactions recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProfitAndLoss;

