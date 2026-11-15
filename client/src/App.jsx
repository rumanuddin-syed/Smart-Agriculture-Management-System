import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Core Tool Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CropRecommendation from './pages/CropRecommendation';
import DiseaseDetection from './pages/DiseaseDetection';
import NearbyServices from './pages/NearbyServices';
import History from './pages/History';
import Profile from './pages/Profile';

// Direct Marketplace Pages
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import FarmersDirectory from './pages/FarmersDirectory';
import FarmerProfileView from './pages/FarmerProfileView';
import Cart from './pages/Cart';
import OrderDetails from './pages/OrderDetails';
import ConsumerOrders from './pages/ConsumerOrders';

// Farmer Hub Pages
import FarmerDashboard from './pages/FarmerDashboard';
import FarmerProducts from './pages/FarmerProducts';
import ProductForm from './pages/ProductForm';
import FarmerOrders from './pages/FarmerOrders';
import CultivationExpenses from './pages/CultivationExpenses';
import ProfitAndLoss from './pages/ProfitAndLoss';
import FarmerSettingsProfile from './pages/FarmerSettingsProfile';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-emerald"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-agri-light font-sans text-agri-dark">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/product/:id" element={<ProductDetail />} />
            <Route path="/marketplace/farmers" element={<FarmersDirectory />} />
            <Route path="/marketplace/farmers/:farmerId" element={<FarmerProfileView />} />
            <Route path="/cart" element={<Cart />} />

            {/* Core Tools (Any Authenticated User) */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/crop-recommendation" element={<ProtectedRoute><CropRecommendation /></ProtectedRoute>} />
            <Route path="/disease-detection" element={<ProtectedRoute><DiseaseDetection /></ProtectedRoute>} />
            <Route path="/nearby" element={<ProtectedRoute><NearbyServices /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Consumer Order Management */}
            <Route path="/consumer/orders" element={<ProtectedRoute><ConsumerOrders /></ProtectedRoute>} />
            <Route path="/consumer/orders/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />

            {/* Farmer Business Suite (Farmers Only) */}
            <Route path="/farmer/dashboard" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerDashboard /></ProtectedRoute>} />
            <Route path="/farmer/products" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerProducts /></ProtectedRoute>} />
            <Route path="/farmer/products/new" element={<ProtectedRoute allowedRoles={['farmer']}><ProductForm /></ProtectedRoute>} />
            <Route path="/farmer/products/edit/:id" element={<ProtectedRoute allowedRoles={['farmer']}><ProductForm /></ProtectedRoute>} />
            <Route path="/farmer/orders" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerOrders /></ProtectedRoute>} />
            <Route path="/farmer/expenses" element={<ProtectedRoute allowedRoles={['farmer']}><CultivationExpenses /></ProtectedRoute>} />
            <Route path="/farmer/profit-loss" element={<ProtectedRoute allowedRoles={['farmer']}><ProfitAndLoss /></ProtectedRoute>} />
            <Route path="/farmer/profile" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerSettingsProfile /></ProtectedRoute>} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-agri-dark text-white py-8 border-t border-emerald-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <img src="/assets/app_logo.png" alt="Logo" className="h-8 w-8 rounded" />
                <span className="font-outfit font-bold text-lg">Smart Agriculture Management & Direct Marketplace</span>
              </div>
              <p className="text-xs text-gray-400">
                &copy; 2026 Smart Agri. Built with MERN Stack + Python ML. Demo Marketplace.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
