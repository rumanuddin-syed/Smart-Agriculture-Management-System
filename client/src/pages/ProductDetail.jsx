import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import {
  MapPin,
  CheckCircle2,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Calendar,
  Sparkles,
  ArrowLeft,
  Store,
  User
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/marketplace/products/${id}`);
      setProduct(res.data.product);
      setQuantity(res.data.product.minOrderQty || 1);
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, Number(quantity));
    setToastMessage(`Added ${quantity} ${product.unit} to cart!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-emerald"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-agri-forest mb-4">Product Not Found</h2>
        <p className="text-gray-600 mb-6">The listing you requested is inactive or has been removed.</p>
        <Link to="/marketplace" className="btn-primary">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const farmer = product.farmerInfo;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-agri-forest text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-agri-mint" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-1 text-sm font-semibold text-agri-forest hover:text-agri-emerald mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-14 bg-white p-6 md:p-10 rounded-3xl border border-emerald-100 shadow-sm">
        {/* Left: Images */}
        <div>
          <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-gray-100 mb-4 border border-gray-100">
            <img
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isOrganic && (
              <span className="absolute top-4 left-4 bg-agri-forest/90 text-agri-mint font-bold text-xs px-3 py-1 rounded-full shadow-md">
                🌿 Certified Organic
              </span>
            )}
            <span className="absolute top-4 right-4 bg-white/90 text-agri-forest font-bold text-xs px-3 py-1 rounded-full shadow-md">
              {product.category}
            </span>
          </div>
        </div>

        {/* Right: Details & Purchase */}
        <div className="flex flex-col justify-between">
          <div>
            {/* Farmer pill */}
            <div className="flex items-center justify-between mb-3">
              <Link
                to={`/marketplace/farmers/${farmer?.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-agri-emerald hover:underline bg-emerald-50 px-3 py-1 rounded-full"
              >
                <Store className="h-3.5 w-3.5" />
                <span>{farmer?.farmName || farmer?.name}</span>
              </Link>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-agri-emerald" />
                {farmer?.district || product.location?.district}, {farmer?.state || product.location?.state}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-agri-forest mb-3">
              {product.name}
            </h1>

            {/* Price section */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-black text-agri-forest">
                ₹{product.pricePerUnit}
              </span>
              <span className="text-sm text-gray-500 font-medium">/ {product.unit}</span>
              <span className="text-xs text-gray-400">inclusive of direct farm packing</span>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              {product.description || 'Freshly harvested produce directly from local fields.'}
            </p>

            {/* Value Props & Attributes */}
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-6 bg-agri-light/60 p-4 rounded-xl border border-emerald-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-agri-emerald" />
                <span>Farming: <strong className="capitalize">{product.farmingMethod}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-agri-emerald" />
                <span>Freshness: <strong>{product.freshnessDuration}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-agri-emerald" />
                <span>Delivery: <strong>Local & Pickup</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-agri-emerald" />
                <span>Stock: <strong>{product.stock} {product.unit} available</strong></span>
              </div>
            </div>
          </div>

          {/* Add to Cart Controls */}
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <button
                  onClick={() => setQuantity(Math.max(product.minOrderQty || 1, quantity - 1))}
                  className="px-3.5 py-2 text-base font-bold text-gray-600 hover:bg-gray-200"
                >
                  -
                </button>
                <input
                  type="number"
                  min={product.minOrderQty || 1}
                  max={Math.min(product.maxOrderQty || 1000, product.stock)}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-14 text-center bg-transparent text-sm font-bold text-agri-forest focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3.5 py-2 text-base font-bold text-gray-600 hover:bg-gray-200"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                Total: <strong className="text-agri-forest text-sm font-extrabold">₹{product.pricePerUnit * quantity}</strong>
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2 disabled:bg-gray-300"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Shopping Cart'}</span>
              </button>
              <Link to="/cart" className="btn-outline py-3 px-5 text-sm">
                View Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

