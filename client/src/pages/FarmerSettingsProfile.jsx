import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, MapPin, Store, CheckCircle2, Phone, Save, AlertCircle } from 'lucide-react';

const FarmerSettingsProfile = () => {
  const [formData, setFormData] = useState({
    farmName: '',
    farmDescription: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    contactPhone: '',
    farmingMethod: 'organic',
    cropsCultivated: '',
    deliveryAreas: '',
    pickupAvailable: true,
    deliveryAvailable: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/marketplace/farmer/profile');
      const p = res.data.profile;
      if (p) {
        setFormData({
          farmName: p.farmName || '',
          farmDescription: p.farmDescription || '',
          village: p.village || '',
          district: p.district || '',
          state: p.state || '',
          pincode: p.pincode || '',
          contactPhone: p.contactPhone || '',
          farmingMethod: p.farmingMethod || 'organic',
          cropsCultivated: p.cropsCultivated ? p.cropsCultivated.join(', ') : '',
          deliveryAreas: p.deliveryAreas ? p.deliveryAreas.join(', ') : '',
          pickupAvailable: p.pickupAvailable ?? true,
          deliveryAvailable: p.deliveryAvailable ?? true
        });
      }
    } catch (err) {
      console.error('Error fetching farmer profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await axios.put('/api/marketplace/farmer/profile', formData);
      setToastMessage('Farm profile updated successfully!');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-agri-forest text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-agri-mint" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-agri-forest">Farm & Producer Profile</h1>
        <p className="text-sm text-gray-600 mt-1">
          This public profile tells consumers about your farming techniques, harvest location, and delivery policies.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="card p-8 border border-emerald-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Farm / Estate Name *</label>
              <input
                type="text"
                name="farmName"
                required
                value={formData.farmName}
                onChange={handleChange}
                placeholder="e.g. Green Valley Organic Agro"
                className="input-field text-xs py-2"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Contact Phone Number</label>
              <input
                type="text"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Farm Story & Cultivation Methods</label>
            <textarea
              name="farmDescription"
              rows={3}
              value={formData.farmDescription}
              onChange={handleChange}
              placeholder="Tell consumers about your organic practices, soil health, and harvest quality..."
              className="input-field text-xs py-2"
            />
          </div>

          <div className="grid sm:grid-cols-4 gap-4">
            <div>
              <label className="font-semibold block mb-1">Village / Town</label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                className="input-field text-xs py-2"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">District *</label>
              <input
                type="text"
                name="district"
                required
                value={formData.district}
                onChange={handleChange}
                className="input-field text-xs py-2"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">State *</label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="input-field text-xs py-2"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">PIN Code *</label>
              <input
                type="text"
                name="pincode"
                required
                value={formData.pincode}
                onChange={handleChange}
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Primary Farming Method</label>
              <select
                name="farmingMethod"
                value={formData.farmingMethod}
                onChange={handleChange}
                className="input-field text-xs py-2"
              >
                <option value="organic">100% Certified Organic</option>
                <option value="natural">Natural / Zero-Budget Farming</option>
                <option value="conventional">Conventional Agriculture</option>
                <option value="mixed">Mixed Farming</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Crops Cultivated (comma separated)</label>
              <input
                type="text"
                name="cropsCultivated"
                value={formData.cropsCultivated}
                onChange={handleChange}
                placeholder="Tomato, Potato, Wheat, Basmati Rice"
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Preferred Local Delivery Areas / Pincodes</label>
            <input
              type="text"
              name="deliveryAreas"
              value={formData.deliveryAreas}
              onChange={handleChange}
              placeholder="e.g. Nashik City, Mumbai Suburban, 422001, 422002"
              className="input-field text-xs py-2"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-2 font-semibold text-agri-forest cursor-pointer bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <input
                type="checkbox"
                name="pickupAvailable"
                checked={formData.pickupAvailable}
                onChange={handleChange}
                className="rounded text-agri-emerald focus:ring-agri-emerald"
              />
              <span>🏡 Farm Pickup Available for Customers</span>
            </label>

            <label className="flex items-center gap-2 font-semibold text-agri-forest cursor-pointer bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <input
                type="checkbox"
                name="deliveryAvailable"
                checked={formData.deliveryAvailable}
                onChange={handleChange}
                className="rounded text-agri-emerald focus:ring-agri-emerald"
              />
              <span>🚚 Local Doorstep Delivery Supported</span>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Farmer Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmerSettingsProfile;

