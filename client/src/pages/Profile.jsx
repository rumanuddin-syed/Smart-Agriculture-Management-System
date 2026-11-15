import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, Save, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.location?.city || '',
    state: user?.location?.state || ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const res = await axios.put('/api/auth/profile', {
        name: formData.name,
        phone: formData.phone,
        location: {
          city: formData.city,
          state: formData.state
        }
      });
      setUser(res.data.user);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-agri-forest flex items-center justify-center gap-3">
          <User className="h-8 w-8 text-agri-emerald" />
          My Profile
        </h1>
        <p className="text-gray-600 mt-3">Manage your account settings and location preferences.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100">
        {/* User Avatar Placeholder */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-agri-emerald rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'F'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-agri-forest">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-agri-light text-agri-forest text-xs rounded-full font-medium capitalize">
              {user?.role || 'farmer'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm">
              <CheckCircle className="h-5 w-5" />
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email (Read-Only)</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input-field bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Nagpur"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Maharashtra"
              />
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={saving} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              <Save className="h-5 w-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
