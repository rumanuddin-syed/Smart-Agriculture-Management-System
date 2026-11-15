import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, AlertTriangle, Package, CheckCircle2 } from 'lucide-react';

const FarmerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/marketplace/farmer/products');
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Error fetching farmer products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await axios.patch(`/api/marketplace/farmer/products/${id}/toggle`);
      setToastMessage(res.data.message);
      fetchProducts();
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error toggling product status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await axios.delete(`/api/marketplace/farmer/products/${id}`);
      setToastMessage('Product deleted successfully');
      fetchProducts();
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product');
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-agri-forest">My Produce Listings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your harvest inventory, adjust unit rates, and publish seasonal produce.
          </p>
        </div>

        <Link to="/farmer/products/new" className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Add New Produce</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-emerald"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center max-w-md mx-auto">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-agri-forest mb-2">No Produce Listed Yet</h3>
          <p className="text-sm text-gray-500 mb-6">
            Start selling directly to consumers by listing your first harvested crop!
          </p>
          <Link to="/farmer/products/new" className="btn-primary">
            Create First Listing
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto border border-emerald-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-emerald-50/60 text-gray-600 uppercase font-semibold border-b border-emerald-100">
              <tr>
                <th className="px-5 py-3.5">Produce</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Stock</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-4 flex items-center gap-3">
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80'}
                      alt={p.name}
                      className="h-10 w-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                    />
                    <div>
                      <span className="font-bold text-agri-forest text-sm block">{p.name}</span>
                      {p.isOrganic && (
                        <span className="text-[10px] text-agri-emerald font-semibold">🌿 Organic</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600 font-medium">{p.category}</td>
                  <td className="px-5 py-4 font-bold text-agri-forest">
                    ₹{p.pricePerUnit} <span className="text-gray-400 font-normal">/ {p.unit}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`font-bold ${
                        p.stock <= 10 ? 'text-amber-600 font-black' : 'text-gray-700'
                      }`}
                    >
                      {p.stock} {p.unit}
                    </span>
                    {p.stock <= 10 && (
                      <span className="text-[10px] text-amber-600 block">Low Stock!</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        p.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : p.status === 'sold_out'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleStatus(p._id)}
                      className="text-gray-500 hover:text-agri-emerald p-1"
                      title="Toggle Active/Inactive"
                    >
                      {p.status === 'active' ? (
                        <ToggleRight className="h-5 w-5 text-agri-emerald inline" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400 inline" />
                      )}
                    </button>
                    <Link
                      to={`/farmer/products/edit/${p._id}`}
                      className="text-gray-500 hover:text-blue-600 p-1 inline-block"
                      title="Edit Product"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                      title="Delete Product"
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

export default FarmerProducts;

