import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Calendar, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

const categories = [
  'All',
  'Seeds',
  'Fertilizers',
  'Pesticides',
  'Organic Treatments',
  'Irrigation',
  'Labour',
  'Equipment',
  'Transport',
  'Packaging',
  'Land Preparation',
  'Other'
];

const CultivationExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Seeds',
    amount: '',
    cropName: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      const res = await axios.get('/api/marketplace/farmer/expenses', { params });
      setExpenses(res.data.expenses || []);
      setTotalExpenses(res.data.totalExpenses || 0);
      setCategoryTotals(res.data.categoryTotals || {});
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/marketplace/farmer/expenses', formData);
      setShowAddModal(false);
      setFormData({
        category: 'Seeds',
        amount: '',
        cropName: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setToastMessage('Cultivation expense logged successfully!');
      fetchExpenses();
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense record?')) return;
    try {
      await axios.delete(`/api/marketplace/farmer/expenses/${id}`);
      setToastMessage('Expense deleted');
      fetchExpenses();
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert('Error deleting expense');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-agri-forest text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-agri-mint" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-sm text-agri-forest">Record Cultivation Cost</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400">✕</button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Expense Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field text-xs py-2"
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Amount Incurred (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g. 3500"
                  className="input-field text-xs py-2"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Crop / Product Association</label>
                <input
                  type="text"
                  value={formData.cropName}
                  onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                  placeholder="e.g. Tomato, Basmati Rice"
                  className="input-field text-xs py-2"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field text-xs py-2"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Description / Vendor Notes</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 5 bags of organic compost fertilizer..."
                  className="input-field text-xs py-2"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1 py-2">
                  Save Expense Record
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline py-2 px-4"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-agri-forest">Cultivation Expense Tracker</h1>
          <p className="text-sm text-gray-600 mt-1">
            Log raw input expenses to calculate accurate profit margins and financial health.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Log Cultivation Cost</span>
        </button>
      </div>

      {/* Overview Stat */}
      <div className="card p-6 border-l-4 border-l-red-500 mb-8 flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase">Total Recorded Expenses</span>
          <div className="text-3xl font-black text-red-600 mt-1">₹{totalExpenses}</div>
        </div>
        <span className="text-xs text-gray-400">Total Entries: {expenses.length}</span>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-agri-emerald text-white'
                : 'bg-white text-gray-600 border border-gray-100 hover:bg-emerald-50'
            }`}
          >
            {cat} {categoryTotals[cat] ? `(₹${categoryTotals[cat]})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-emerald"></div>
        </div>
      ) : expenses.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          No expenses recorded in this category.
        </div>
      ) : (
        <div className="card overflow-x-auto border border-emerald-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-emerald-50/60 text-gray-600 uppercase font-semibold border-b">
              <tr>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Associated Crop</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((e) => (
                <tr key={e._id} className="hover:bg-gray-50/70">
                  <td className="px-5 py-3.5 font-bold text-agri-forest">{e.category}</td>
                  <td className="px-5 py-3.5 text-gray-600">{e.cropName || 'General Farm'}</td>
                  <td className="px-5 py-3.5 text-gray-500">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-gray-600 max-w-xs truncate">{e.description || '—'}</td>
                  <td className="px-5 py-3.5 font-black text-red-600 text-sm">₹{e.amount}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDeleteExpense(e._id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                      title="Delete expense"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CultivationExpenses;

