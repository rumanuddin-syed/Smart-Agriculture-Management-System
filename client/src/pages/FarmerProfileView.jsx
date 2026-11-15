import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import {
  MapPin,
  Store,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ShoppingBag,
  Leaf
} from 'lucide-react';

const FarmerProfileView = () => {
  const { farmerId } = useParams();
  const [farmerData, setFarmerData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const { addToCart } = useCart();

  useEffect(() => {
    fetchFarmerInfo();
  }, [farmerId]);

  const fetchFarmerInfo = async () => {
    setLoading(true);
    try {
      const [fRes, pRes] = await Promise.all([
        axios.get(`/api/marketplace/farmers/${farmerId}`),
        axios.get(`/api/marketplace/products?farmerId=${farmerId}`)
      ]);
      setFarmerData(fRes.data.farmer);
      setProducts(pRes.data.products || []);
    } catch (err) {
      console.error('Error fetching farmer profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setToastMessage(`Added "${product.name}" to cart!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-emerald"></div>
      </div>
    );
  }

  if (!farmerData) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-agri-forest mb-4">Farmer Profile Not Found</h2>
        <Link to="/marketplace/farmers" className="btn-primary">
          Back to Directory
        </Link>
      </div>
    );
  }

  const { profile } = farmerData;

  return (
    <div className="min-h-screen bg-agri-light/40 py-10">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-agri-forest text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-agri-mint" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Farmer Header Card */}
        <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-agri-emerald text-white flex items-center justify-center text-3xl font-extrabold shadow-sm flex-shrink-0">
              {farmerData.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-agri-forest">
                  {profile.farmName || `${farmerData.name}'s Farm`}
                </h1>
                <span className="bg-emerald-50 text-agri-emerald text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Verified Farmer
                </span>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-2 mb-2">
                <span>Cultivator: <strong>{farmerData.name}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-agri-emerald" />
                  {profile.village ? `${profile.village}, ` : ''}{profile.district}, {profile.state}
                </span>
              </p>
              <p className="text-xs text-gray-600 max-w-xl">
                {profile.farmDescription || 'Committed to delivering nutrient-rich produce directly from our soil.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-auto text-xs text-gray-600 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
            <div>Farming Method: <strong className="capitalize">{profile.farmingMethod || 'organic'}</strong></div>
            <div>Active Listings: <strong>{products.length} products</strong></div>
            <div>Pickup: <strong>{profile.pickupAvailable ? 'Available' : 'No'}</strong></div>
            <div>Home Delivery: <strong>{profile.deliveryAvailable ? 'Available' : 'No'}</strong></div>
          </div>
        </div>

        {/* Listings Section */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-agri-forest">
            Available Produce from this Farm ({products.length})
          </h2>
          <Link to="/marketplace" className="text-xs font-semibold text-agri-emerald hover:underline">
            View All Marketplace Produce →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="card p-10 text-center text-gray-500">
            This farmer has no active produce listings right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="card flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="h-44 bg-gray-100 relative overflow-hidden">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.isOrganic && (
                    <span className="absolute top-2 left-2 bg-agri-forest text-agri-mint text-[10px] font-bold px-2 py-0.5 rounded">
                      Organic
                    </span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-agri-forest mb-1 line-clamp-1">{product.name}</h3>
                    <div className="flex items-baseline gap-1.5 mb-3">
                      <span className="text-lg font-black text-agri-forest">₹{product.pricePerUnit}</span>
                      <span className="text-xs text-gray-500">/ {product.unit}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/marketplace/product/${product._id}`} className="btn-outline flex-1 py-1.5 text-xs text-center">
                      Details
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="btn-primary py-1.5 px-3 text-xs"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerProfileView;

