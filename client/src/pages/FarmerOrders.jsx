import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Eye,
  FileText,
  User,
  AlertCircle
} from 'lucide-react';

const FarmerOrders = () => {
  const [suborders, setSuborders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedProof, setSelectedProof] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/marketplace/farmer/suborders');
      setSuborders(res.data.suborders || []);
    } catch (err) {
      console.error('Error fetching farmer suborders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDecision = async (proofId, decision) => {
    try {
      const res = await axios.post(`/api/marketplace/farmer/payment/review/${proofId}`, {
        decision,
        reviewNote
      });
      setToastMessage(res.data.message);
      setSelectedProof(null);
      setReviewNote('');
      fetchOrders();
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error reviewing payment');
    }
  };

  const handleStatusTransition = async (suborderId, newStatus) => {
    try {
      const res = await axios.patch(`/api/marketplace/farmer/suborders/${suborderId}/status`, {
        status: newStatus
      });
      setToastMessage(res.data.message);
      fetchOrders();
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const filteredSuborders = suborders.filter((s) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PROOF_SUBMITTED') return s.paymentStatus === 'PROOF_SUBMITTED';
    if (activeTab === 'PROCESSING') return s.fulfilmentStatus === 'ACCEPTED' || s.fulfilmentStatus === 'PROCESSING';
    if (activeTab === 'DISPATCHED') return s.fulfilmentStatus === 'DISPATCHED' || s.fulfilmentStatus === 'READY_FOR_DISPATCH';
    if (activeTab === 'DELIVERED') return s.fulfilmentStatus === 'DELIVERED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-agri-forest text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-agri-mint" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Review Payment Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-sm text-agri-forest">
                Review Demo Payment Proof
              </h3>
              <button onClick={() => setSelectedProof(null)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            <div className="h-64 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border">
              <img
                src={selectedProof.screenshotUrl}
                alt="Payment proof"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="text-xs space-y-1">
              <div>Reference / UTR: <strong className="font-mono">{selectedProof.paymentReference}</strong></div>
              <div>Payment Mode: <strong className="font-mono">{selectedProof.paymentMethod}</strong></div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Farmer Verification Note
              </label>
              <input
                type="text"
                placeholder="e.g. Screenshot verified for demonstration."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="input-field text-xs py-1.5"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleReviewDecision(selectedProof._id, 'APPROVE')}
                className="btn-primary flex-1 py-2 text-xs"
              >
                Approve (Demo)
              </button>
              <button
                onClick={() => handleReviewDecision(selectedProof._id, 'REJECT')}
                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg px-4 py-2 text-xs font-semibold"
              >
                Reject Proof
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-agri-forest">Farmer Order Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Inspect customer payment screenshots, approve simulated payments, and manage fulfillment stages.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-3">
        {[
          { key: 'ALL', label: `All Orders (${suborders.length})` },
          { key: 'PROOF_SUBMITTED', label: `Proofs to Review (${suborders.filter(s => s.paymentStatus === 'PROOF_SUBMITTED').length})` },
          { key: 'PROCESSING', label: 'In Preparation' },
          { key: 'DISPATCHED', label: 'Dispatched' },
          { key: 'DELIVERED', label: 'Delivered' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-xs px-3.5 py-2 rounded-lg font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-agri-emerald text-white'
                : 'bg-white text-gray-600 hover:bg-emerald-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-emerald"></div>
        </div>
      ) : filteredSuborders.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          No suborders found in this category.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSuborders.map((suborder) => (
            <div key={suborder._id} className="card p-6 border border-emerald-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                <div>
                  <span className="font-mono text-sm font-bold text-agri-forest">
                    Suborder #{suborder.suborderNumber}
                  </span>
                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    <span>Buyer: <strong>{suborder.consumerId?.name}</strong></span>
                    <span>•</span>
                    <span>Phone: {suborder.consumerId?.phone || 'N/A'}</span>
                    <span>•</span>
                    <span>{new Date(suborder.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      suborder.paymentStatus === 'APPROVED_DEMO'
                        ? 'bg-green-100 text-green-800'
                        : suborder.paymentStatus === 'PROOF_SUBMITTED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Payment: {suborder.paymentStatus}
                  </span>

                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                    Status: {suborder.fulfilmentStatus}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="divide-y divide-gray-100 text-xs">
                {suborder.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex justify-between">
                    <span>
                      {it.name} — {it.quantity} {it.unit} @ ₹{it.price}
                    </span>
                    <span className="font-bold">₹{it.subtotal}</span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between font-extrabold text-sm text-agri-forest">
                  <span>Suborder Total Payable:</span>
                  <span>₹{suborder.subtotal}</span>
                </div>
              </div>

              {/* Address */}
              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                <strong>Delivery Address:</strong> {suborder.parentOrderId?.deliveryAddress?.fullName},{' '}
                {suborder.parentOrderId?.deliveryAddress?.street},{' '}
                {suborder.parentOrderId?.deliveryAddress?.city} - {suborder.parentOrderId?.deliveryAddress?.pincode}
              </div>

              {/* Actions Toolbar */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
                {/* Payment Review Button */}
                {suborder.latestPaymentProof && (
                  <button
                    onClick={() => setSelectedProof(suborder.latestPaymentProof)}
                    className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>
                      {suborder.paymentStatus === 'PROOF_SUBMITTED'
                        ? 'Review Submitted Screenshot'
                        : 'Inspect Payment Proof'}
                    </span>
                  </button>
                )}

                {/* Fulfilment stage transitions */}
                <div className="flex gap-2 flex-wrap">
                  {suborder.fulfilmentStatus === 'PLACED' && (
                    <button
                      onClick={() => handleStatusTransition(suborder._id, 'ACCEPTED')}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Accept Order
                    </button>
                  )}

                  {suborder.fulfilmentStatus === 'ACCEPTED' && (
                    <button
                      onClick={() => handleStatusTransition(suborder._id, 'PROCESSING')}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Mark In-Preparation
                    </button>
                  )}

                  {suborder.fulfilmentStatus === 'PROCESSING' && (
                    <button
                      onClick={() => handleStatusTransition(suborder._id, 'DISPATCHED')}
                      disabled={suborder.paymentStatus !== 'APPROVED_DEMO'}
                      className="btn-primary text-xs py-1.5 px-3 disabled:bg-gray-300"
                      title={suborder.paymentStatus !== 'APPROVED_DEMO' ? 'Approve demo payment first' : ''}
                    >
                      Mark Dispatched
                    </button>
                  )}

                  {suborder.fulfilmentStatus === 'DISPATCHED' && (
                    <button
                      onClick={() => handleStatusTransition(suborder._id, 'DELIVERED')}
                      className="bg-green-600 text-white font-semibold text-xs py-1.5 px-4 rounded-lg hover:bg-green-700"
                    >
                      Mark Delivered (Completed)
                    </button>
                  )}

                  {!['DELIVERED', 'CANCELLED', 'REJECTED_BY_FARMER'].includes(suborder.fulfilmentStatus) && (
                    <button
                      onClick={() => handleStatusTransition(suborder._id, 'REJECTED_BY_FARMER')}
                      className="text-xs text-red-600 hover:underline px-2 py-1"
                    >
                      Reject Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;

