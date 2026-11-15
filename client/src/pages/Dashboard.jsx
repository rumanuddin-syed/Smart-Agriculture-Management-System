import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Microscope, Map, Clock, Leaf } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-agri-forest">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">What would you like to do today?</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Crop Recommendation Card */}
        <Link to="/crop-recommendation" className="card p-6 hover:shadow-md hover:border-agri-emerald transition-all group block">
          <div className="bg-agri-light w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-agri-emerald group-hover:text-white text-agri-emerald transition-colors">
            <Sprout className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-agri-forest mb-2">Crop Recommendation</h3>
          <p className="text-sm text-gray-600">Enter soil N-P-K data for AI crop predictions.</p>
        </Link>

        {/* Disease Detection Card */}
        <Link to="/disease-detection" className="card p-6 hover:shadow-md hover:border-agri-emerald transition-all group block">
          <div className="bg-agri-light w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-agri-emerald group-hover:text-white text-agri-emerald transition-colors">
            <Microscope className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-agri-forest mb-2">Disease Detection</h3>
          <p className="text-sm text-gray-600">Upload leaf images for instant diagnosis.</p>
        </Link>

        {/* Nearby Services Card */}
        <Link to="/nearby" className="card p-6 hover:shadow-md hover:border-agri-emerald transition-all group block">
          <div className="bg-agri-light w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-agri-emerald group-hover:text-white text-agri-emerald transition-colors">
            <Map className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-agri-forest mb-2">Nearby Services</h3>
          <p className="text-sm text-gray-600">Find fertilizer shops & plant clinics near you.</p>
        </Link>

        {/* History Card */}
        <Link to="/history" className="card p-6 hover:shadow-md hover:border-agri-emerald transition-all group block">
          <div className="bg-agri-light w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-agri-emerald group-hover:text-white text-agri-emerald transition-colors">
            <Clock className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-agri-forest mb-2">History & Logs</h3>
          <p className="text-sm text-gray-600">View past soil tests and leaf diagnoses.</p>
        </Link>
      </div>

      <div className="card p-8 bg-gradient-to-r from-agri-emerald to-agri-forest text-white overflow-hidden relative">
        <div className="relative z-10 md:w-2/3">
          <h2 className="text-2xl font-bold mb-4">Did you know?</h2>
          <p className="mb-6 opacity-90">
            Maintaining optimal soil pH is crucial. Most crops thrive in a pH range of 6.0 to 7.0. Regular soil testing helps prevent nutrient lock-up.
          </p>
          <Link to="/crop-recommendation" className="bg-white text-agri-forest font-semibold px-6 py-2 rounded-lg hover:bg-agri-light transition-colors inline-block">
            Test your soil now
          </Link>
        </div>
        {/* Abstract background element */}
        <div className="absolute right-0 bottom-0 transform translate-x-1/4 translate-y-1/4 opacity-20 hidden md:block">
          <Leaf className="w-64 h-64" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
