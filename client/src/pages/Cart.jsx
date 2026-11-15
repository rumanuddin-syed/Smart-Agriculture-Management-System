import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Trash2,
  Store,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Truck
} from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, groupedByFarmer, grandTotal } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: user?.location?.city || '',
    district: '',
    state: user?.location?.state || '',
    pincode: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddressChange = (e) => {
    setDeliveryAddress({ ...deliveryAddress, [e.target.name]: e.target.value });
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      navigate('/login?redirect=/cart');
      return;
    }

    if (!deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.pincode) {
      setError('Please fill in all mandatory address fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity
        })),
        deliveryAddress,
        deliveryMethod
      };

      const res = await axios.post('/api/marketplace/checkout', payload);
      clearCart();
      // Redirect to newly created order
      navigate(`/consumer/orders/${res.data.checkoutId}`);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Error completing checkout. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="bg-emerald-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6 text-agri-emerald">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-agri-forest mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-sm text-gray-600 mb-8 max-w-sm mx-auto">
          Explore the farmers marketplace to find fresh grains, seasonal fruits, and organic vegetables!
        </p>
        <Link to="/marketplace" className="btn-primary">
          Browse Produce
        </Link>
      </div>
    );
  }

  const farmerCount = Object.keys(groupedByFarmer).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-agri-forest">Shopping Cart & Checkout</h1>
        <p className="text-sm text-gray-600 mt-1">
          Review your items, grouped by their independent farm producers.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Multi-Farmer Checkout Explainer Banner */}
      {farmerCount > 1 && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-agri-forest">
          <ShieldCheck className="h-5 w-5 text-agri-emerald flex-shrink-0 mt-0.5" />
          <div>
            <strong>Multi-Farmer Checkout Notice:</strong> You are purchasing produce from <strong>{farmerCount} different independent farmers</strong>. A unified checkout will be placed, and each farmer will independently receive and fulfill their suborder. You will be able to submit simulated payment proofs per farmer.
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left: Cart Items Grouped by Farmer */}
        <div className="lg:col-span-2 space-y-6">
          {Object.values(groupedByFarmer).map((group) => (
            <div key={group.farmerId} className="card p-6 border border-emerald-100">
              {/* Farmer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-agri-emerald" />
                  <span className="font-bold text-sm text-agri-forest">{group.farmName}</span>
                  <span className="text-xs text-gray-500">({group.farmerName})</span>
                </div>
                <span className="text-xs font-semibold text-agri-emerald bg-emerald-50 px-2.5 py-1 rounded-full">
                  Subtotal: ₹{group.subtotal}
                </span>
              </div>

              {/* Items in this farm suborder */}
              <div className="divide-y divide-gray-100">
                {group.items.map((item) => (
                  <div key={item.productId} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}
                        alt={item.name}
                        className="h-14 w-14 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-agri-forest line-clamp-1">{item.name}</h4>
                        <div className="text-xs text-gray-500">
                          ₹{item.price} / {item.unit}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold text-agri-forest">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-bold text-agri-forest w-16 text-right">
                        ₹{item.price * item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <Link to="/marketplace" className="text-xs font-semibold text-agri-emerald hover:underline">
              ← Continue Shopping
            </Link>
            <button onClick={clearCart} className="text-xs font-semibold text-red-600 hover:underline">
              Clear Entire Cart
            </button>
          </div>
        </div>

        {/* Right: Checkout & Delivery Form */}
        <div>
          <div className="card p-6 border border-emerald-100 sticky top-28 space-y-6">
            <h3 className="text-lg font-bold text-agri-forest pb-3 border-b border-gray-100">
              Delivery & Order Summary
            </h3>

            {/* Delivery Method Choice */}
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                Fulfillment Option:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                    deliveryMethod === 'delivery'
                      ? 'bg-agri-emerald text-white border-agri-emerald'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  🚚 Local Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                    deliveryMethod === 'pickup'
                      ? 'bg-agri-emerald text-white border-agri-emerald'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  🏡 Farm Pickup
                </button>
              </div>
            </div>

            {/* Delivery Address Form */}
            <form onSubmit={handleCheckoutSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={deliveryAddress.fullName}
                  onChange={handleAddressChange}
                  className="input-field text-xs py-1.5"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={deliveryAddress.phone}
                  onChange={handleAddressChange}
                  className="input-field text-xs py-1.5"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Street / Area Address *</label>
                <input
                  type="text"
                  name="street"
                  required
                  value={deliveryAddress.street}
                  onChange={handleAddressChange}
                  className="input-field text-xs py-1.5"
                  placeholder="House 42, Green Avenue, Farm Road"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-600">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={deliveryAddress.city}
                    onChange={handleAddressChange}
                    className="input-field text-xs py-1.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">PIN Code *</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={deliveryAddress.pincode}
                    onChange={handleAddressChange}
                    className="input-field text-xs py-1.5"
                    placeholder="400001"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">State *</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={deliveryAddress.state}
                  onChange={handleAddressChange}
                  className="input-field text-xs py-1.5"
                />
              </div>

              {/* Price Calculation Box */}
              <div className="pt-4 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.length} items):</span>
                  <span>₹{grandTotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Farm Direct Delivery:</span>
                  <span className="text-agri-emerald font-semibold">FREE (Demo)</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-agri-forest pt-2 border-t border-gray-100">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 text-sm mt-4 shadow-md flex items-center justify-center gap-2"
              >
                <span>{submitting ? 'Placing Orders...' : 'Place Multi-Farmer Order'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-[11px] text-gray-400 text-center mt-2">
                Next step: Upload demo payment screenshot for each respective farmer.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

