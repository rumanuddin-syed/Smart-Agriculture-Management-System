import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Package,
  Store,
  Upload,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  FileText,
  ArrowLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingSuborderId, setUploadingSuborderId] = useState(null);
  const [paymentScreenshotFile, setPaymentScreenshotFile] = useState(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/marketplace/consumer/orders/${orderId}`);
      setOrder(res.data.checkout);
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProofSubmit = async (e, suborderId) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMessage('');

    if (!paymentScreenshotFile) {
      setSubmitError('Please choose a screenshot image file.');
      return;
    }

    const formData = new FormData();
    formData.append('suborderId', suborderId);
    formData.append('paymentScreenshot', paymentScreenshotFile);
    formData.append('paymentReference', paymentReference || `UPI-${Date.now()}`);

    try {
      await axios.post('/api/marketplace/payment/upload-proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMessage('Payment screenshot submitted! The farmer will review it.');
      setUploadingSuborderId(null);
      setPaymentScreenshotFile(null);
      setPaymentReference('');
      fetchOrder(); // refresh status
    } catch (err) {
      console.error('Upload proof error:', err);
      setSubmitError(err.response?.data?.message || 'Error uploading screenshot.');
    }
  };

  const handleCancelSuborder = async (suborderId) => {
    if (!window.confirm('Are you sure you want to cancel this suborder?')) return;
    try {
      await axios.post(`/api/marketplace/consumer/suborders/${suborderId}/cancel`, {
        reason: 'Cancelled by customer'
      });
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Error cancelling suborder');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-emerald"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-agri-forest mb-4">Order Not Found</h2>
        <Link to="/consumer/orders" className="btn-primary">
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/consumer/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-agri-emerald hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Order History</span>
      </Link>

      {/* Order Header Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-agri-emerald bg-emerald-50 px-2.5 py-1 rounded-full">
            Checkout #{order.orderNumber}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-agri-forest mt-2">
            Order Confirmation & Payment
          </h1>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>Placed on: {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</span>
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-500 block">Grand Total:</span>
          <span className="text-3xl font-black text-agri-forest">₹{order.grandTotal}</span>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-agri-forest rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-5 w-5 text-agri-emerald flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Suborders Section */}
      <div className="space-y-8">
        <h2 className="text-xl font-bold text-agri-forest">
          Suborders by Producer ({order.suborders.length})
        </h2>

        {order.suborders.map((suborder) => (
          <div key={suborder._id} className="card p-6 border border-emerald-100 space-y-6">
            {/* Farmer Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-agri-emerald rounded-xl">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-agri-forest">
                    Farmer: {suborder.farmerId?.name || 'Local Farmer'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Suborder: <strong className="font-mono">{suborder.suborderNumber}</strong> • Phone: {suborder.farmerId?.phone || 'Provided upon dispatch'}
                  </p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    suborder.paymentStatus === 'APPROVED_DEMO'
                      ? 'bg-green-100 text-green-800'
                      : suborder.paymentStatus === 'PROOF_SUBMITTED'
                      ? 'bg-amber-100 text-amber-800'
                      : suborder.paymentStatus === 'REJECTED_PROOF'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Payment: {suborder.paymentStatus.replace(/_/g, ' ')}
                </span>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    suborder.fulfilmentStatus === 'DELIVERED'
                      ? 'bg-emerald-600 text-white'
                      : suborder.fulfilmentStatus === 'DISPATCHED'
                      ? 'bg-blue-100 text-blue-800'
                      : suborder.fulfilmentStatus === 'ACCEPTED'
                      ? 'bg-purple-100 text-purple-800'
                      : suborder.fulfilmentStatus === 'CANCELLED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  Status: {suborder.fulfilmentStatus.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Items List */}
            <div className="divide-y divide-gray-100">
              {suborder.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageSnapshot || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80'}
                      alt={item.name}
                      className="h-10 w-10 rounded-lg object-cover bg-gray-100"
                    />
                    <div>
                      <span className="font-semibold text-agri-forest">{item.name}</span>
                      <span className="text-xs text-gray-500 block">
                        ₹{item.price} × {item.quantity} {item.unit}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-agri-forest">₹{item.subtotal}</span>
                </div>
              ))}
              <div className="pt-3 flex justify-between text-sm font-extrabold text-agri-forest">
                <span>Suborder Amount:</span>
                <span>₹{suborder.subtotal}</span>
              </div>
            </div>

            {/* Simulated Payment Instructions & Screenshot Area */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-agri-emerald" />
                Simulated Payment Verification (Demo)
              </h4>

              {suborder.paymentStatus === 'PENDING_PAYMENT' || suborder.paymentStatus === 'REJECTED_PROOF' ? (
                <div>
                  <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs text-gray-600 mb-4 space-y-1">
                    <p>
                      <strong>Demo UPI ID:</strong> <span className="font-mono text-agri-emerald font-bold">farmer.{suborder.farmerId?._id?.toString().slice(-6)}@demoagri</span>
                    </p>
                    <p>
                      <strong>Amount Payable:</strong> ₹{suborder.subtotal}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      *Please take a mock payment confirmation screenshot and upload it below for the farmer to approve.
                    </p>
                  </div>

                  {suborder.paymentStatus === 'REJECTED_PROOF' && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                      <strong>Rejection Note from Farmer:</strong> {suborder.rejectionReason || 'Please upload a clear payment screenshot.'}
                    </div>
                  )}

                  {uploadingSuborderId === suborder._id ? (
                    <form onSubmit={(e) => handleUploadProofSubmit(e, suborder._id)} className="space-y-3 bg-white p-4 rounded-xl border border-emerald-200">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          Select Mock Payment Screenshot (JPG, PNG) *
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          required
                          onChange={(e) => setPaymentScreenshotFile(e.target.files[0])}
                          className="text-xs file:btn-primary file:py-1 file:px-3 file:text-xs file:mr-3"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          Transaction Reference / UTR (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. UPI-REF-9928192"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          className="input-field text-xs py-1.5"
                        />
                      </div>
                      {submitError && <p className="text-xs text-red-600">{submitError}</p>}
                      <div className="flex gap-2 pt-2">
                        <button type="submit" className="btn-primary text-xs py-2 px-4">
                          Submit Screenshot Proof
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadingSuborderId(null)}
                          className="btn-outline text-xs py-2 px-3"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setUploadingSuborderId(suborder._id)}
                      className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>{suborder.paymentStatus === 'REJECTED_PROOF' ? 'Re-upload Corrected Proof' : 'Upload Payment Proof'}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-agri-emerald" />
                    <span>
                      Payment Screenshot Submitted (Ref: <span className="font-mono font-bold">{suborder.paymentProof?.paymentReference || 'DEMO-REF'}</span>)
                    </span>
                  </div>
                  {suborder.paymentProof?.screenshotUrl && (
                    <a
                      href={suborder.paymentProof.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-agri-emerald hover:underline font-semibold"
                    >
                      View Submitted Screenshot ↗
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Order Progress Status Timeline */}
            <div className="pt-2">
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Fulfilment Timeline:
              </h5>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {['PLACED', 'ACCEPTED', 'PROCESSING', 'DISPATCHED', 'DELIVERED'].map((step, sIdx) => {
                  const currentIdx = ['PLACED', 'ACCEPTED', 'PROCESSING', 'DISPATCHED', 'DELIVERED'].indexOf(
                    suborder.fulfilmentStatus
                  );
                  const isDone = currentIdx >= sIdx;
                  return (
                    <div key={step} className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-md font-semibold ${
                          isDone ? 'bg-agri-emerald text-white' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {step}
                      </span>
                      {sIdx < 4 && <span className="text-gray-300">→</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cancel eligibility */}
            {!['DISPATCHED', 'DELIVERED', 'CANCELLED', 'REJECTED_BY_FARMER'].includes(suborder.fulfilmentStatus) && (
              <div className="pt-2 text-right">
                <button
                  onClick={() => handleCancelSuborder(suborder._id)}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold hover:underline"
                >
                  Cancel this Suborder
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDetails;

