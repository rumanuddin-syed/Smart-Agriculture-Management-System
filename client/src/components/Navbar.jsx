import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Leaf,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  Store,
  Users,
  Package,
  TrendingUp,
  Receipt,
  User,
  Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (user) {
      axios
        .get('/api/marketplace/notifications')
        .then((res) => setUnreadNotifications(res.data.unreadCount || 0))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isFarmer = user?.role === 'farmer' || user?.role === 'admin';
  const isConsumer = user?.role === 'consumer';

  return (
    <header className="sticky top-0 z-50">
      {/* Demo Simulation Disclaimer Banner */}
      <div className="bg-amber-100 border-b border-amber-200 text-amber-900 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="bg-amber-500 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Demo</span>
        <span>
          <strong>College Demonstration Mode:</strong> Payment screenshots are for simulation only. No real funds or credit cards are processed.
        </span>
      </div>

      <nav className="bg-white shadow-sm border-b border-agri-emerald/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-agri-emerald p-2 rounded-lg">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-outfit font-bold text-agri-forest hidden sm:block">
                  Smart Agri
                </span>
              </Link>

              {/* Public Marketplace Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                <Link
                  to="/marketplace"
                  className="text-agri-forest hover:text-agri-emerald px-3 py-2 rounded-md font-medium flex items-center space-x-1 transition-colors"
                >
                  <Store className="h-4 w-4" />
                  <span>Marketplace</span>
                </Link>
                <Link
                  to="/marketplace/farmers"
                  className="text-agri-forest hover:text-agri-emerald px-3 py-2 rounded-md font-medium flex items-center space-x-1 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>Farmers Directory</span>
                </Link>
              </div>
            </div>

            {/* Right Side Nav */}
            <div className="flex items-center space-x-3">
              {/* Shopping Cart Pill */}
              <Link
                to="/cart"
                className="relative p-2 text-agri-forest hover:text-agri-emerald hover:bg-agri-light rounded-lg transition-colors flex items-center"
                title="View Shopping Cart"
              >
                <ShoppingCart className="h-6 w-6" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-agri-emerald text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                    {totalItemsCount}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  {/* Farmer Specific Links */}
                  {isFarmer && (
                    <div className="hidden lg:flex items-center space-x-1 border-l border-gray-200 pl-3">
                      <Link
                        to="/farmer/dashboard"
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-emerald-50 text-agri-forest hover:bg-emerald-100 transition-colors flex items-center space-x-1"
                      >
                        <TrendingUp className="h-3.5 w-3.5 text-agri-emerald" />
                        <span>Farmer Hub</span>
                      </Link>
                      <Link
                        to="/farmer/products"
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-md text-gray-700 hover:text-agri-emerald transition-colors"
                      >
                        Products
                      </Link>
                      <Link
                        to="/farmer/orders"
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-md text-gray-700 hover:text-agri-emerald transition-colors"
                      >
                        Orders
                      </Link>
                      <Link
                        to="/farmer/profit-loss"
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-md text-gray-700 hover:text-agri-emerald transition-colors"
                      >
                        P&L Reports
                      </Link>
                    </div>
                  )}

                  {/* Consumer Specific Links */}
                  {isConsumer && (
                    <div className="hidden lg:flex items-center space-x-1 border-l border-gray-200 pl-3">
                      <Link
                        to="/consumer/orders"
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-emerald-50 text-agri-forest hover:bg-emerald-100 transition-colors flex items-center space-x-1"
                      >
                        <Package className="h-3.5 w-3.5 text-agri-emerald" />
                        <span>My Orders</span>
                      </Link>
                    </div>
                  )}

                  {/* General Dashboard */}
                  <Link
                    to="/dashboard"
                    className="text-agri-forest hover:text-agri-emerald transition-colors p-2 rounded-md font-medium flex items-center space-x-1"
                    title="Main Dashboard"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="hidden sm:inline text-sm">Tools</span>
                  </Link>

                  <div className="border-l border-gray-200 h-6 mx-1"></div>

                  {/* User Profile Tag */}
                  <div className="flex items-center space-x-2 text-agri-forest font-medium">
                    <div className="bg-agri-light p-1.5 rounded-full">
                      <User className="h-4 w-4 text-agri-emerald" />
                    </div>
                    <div className="hidden sm:block text-left leading-tight">
                      <span className="text-sm font-semibold block">{user.name}</span>
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-agri-forest hover:text-agri-emerald font-medium transition-colors px-3 py-2 text-sm"
                  >
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-sm">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
