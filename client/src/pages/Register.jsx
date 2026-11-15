import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'farmer'
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-emerald-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-agri-light text-agri-emerald rounded-full flex items-center justify-center mb-4">
            <Leaf className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-agri-forest">Join Smart Agri</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to buy or sell fresh farm produce
          </p>
        </div>

        {/* Role Selector Pill */}
        <div className="flex bg-agri-light p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'farmer' })}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              formData.role === 'farmer'
                ? 'bg-agri-emerald text-white shadow-sm'
                : 'text-agri-forest hover:text-agri-emerald'
            }`}
          >
            🌾 Farmer (Seller)
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'consumer' })}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              formData.role === 'consumer'
                ? 'bg-agri-emerald text-white shadow-sm'
                : 'text-agri-forest hover:text-agri-emerald'
            }`}
          >
            🛒 Consumer (Buyer)
          </button>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md flex items-start space-x-2 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="farmer@example.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="+1 234 567 890"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength="6"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-agri-emerald hover:text-agri-forest transition-colors">
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
