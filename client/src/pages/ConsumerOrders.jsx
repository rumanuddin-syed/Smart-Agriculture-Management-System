import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Package, ChevronRight, Calendar, Store, CheckCircle2, AlertCircle } from 'lucide-react';

const ConsumerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/marketplace/consumer/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Error fetching consumer orders:', err);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-agri-forest">My Produce Orders</h1>
        <p className="text-sm text-gray-600 mt-1">
          Track all checkouts and individual farm suborder fulfillments.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center max-w-md mx-auto">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-agri-forest mb-2">No Orders Placed Yet</h3>
          <p className="text-sm text-gray-500 mb-6">
            You haven't ordered any farm produce yet. Discover what's in season!
          </p>
          <Link to="/marketplace" className="btn-primary">
            Visit Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((checkout) => (
            <div key={checkout._id} className="card p-6 border border-emerald-100 hover:shadow-sm transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2 mb-4">
                <div>
                  <span className="font-mono text-sm font-bold text-agri-forest">
                    {checkout.orderNumber}
                  </span>
                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(checkout.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{checkout.suborders?.length || 0} Farmer Suborders</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Total Paid/Payable</span>
                    <span className="text-lg font-extrabold text-agri-forest">
                      ₹{checkout.grandTotal}
                    </span>
                  </div>

                  <Link
                    to={`/consumer/orders/${checkout._id}`}
                    className="btn-outline py-2 px-4 text-xs flex items-center gap-1"
                  >
                    <span>View Details & Payments</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Suborders preview pills */}
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {checkout.suborders?.map((sub) => (
                  <div key={sub._id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                    <div className="flex justify-between font-bold text-agri-forest mb-1">
                      <span>{sub.farmerId?.name || 'Local Farmer'}</span>
                      <span>₹{sub.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>{sub.items?.length} items</span>
                      <span className="font-semibold text-agri-emerald">{sub.fulfilmentStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsumerOrders;

