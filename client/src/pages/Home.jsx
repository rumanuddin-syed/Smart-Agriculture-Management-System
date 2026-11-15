import { Link } from 'react-router-dom';
import { Sprout, Microscope, Map, ShieldCheck } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-agri-dark text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/agri_hero.png"
            alt="Smart Agricultural Field"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-agri-dark to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col justify-center min-h-[600px]">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 max-w-2xl text-agri-light">
            Next-Generation <span className="text-agri-mint">Smart Farming</span> Solutions
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-xl">
            Empower your agricultural journey with AI-driven crop recommendations, instant leaf disease diagnosis, and geolocation-based farming resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Get Started for Free
            </Link>
            <Link to="/login" className="btn-outline border-white text-white hover:bg-white/10 text-lg px-8 py-3">
              Farmer Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-agri-forest mb-4">Powerful Tools for Modern Farmers</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We leverage advanced machine learning models and verified agricultural data to maximize your crop yield and protect your harvest.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 hover:-translate-y-1 transition-transform duration-300">
              <div className="bg-agri-light w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Sprout className="h-8 w-8 text-agri-emerald" />
              </div>
              <h3 className="text-xl font-bold text-agri-forest mb-3">AI Crop Recommendation</h3>
              <p className="text-gray-600 mb-4">
                Input soil N-P-K, pH, and environmental data to receive highly accurate crop planting recommendations using Random Forest algorithms.
              </p>
            </div>

            <div className="card p-8 hover:-translate-y-1 transition-transform duration-300">
              <div className="bg-agri-light w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Microscope className="h-8 w-8 text-agri-emerald" />
              </div>
              <h3 className="text-xl font-bold text-agri-forest mb-3">Leaf Disease Diagnosis</h3>
              <p className="text-gray-600 mb-4">
                Upload a photo of a sick plant leaf. Our staged ML pipeline identifies 116 plant conditions across multiple crops using a calibrated neural ensemble with similarity verification.
              </p>
            </div>

            <div className="card p-8 hover:-translate-y-1 transition-transform duration-300">
              <div className="bg-agri-light w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Map className="h-8 w-8 text-agri-emerald" />
              </div>
              <h3 className="text-xl font-bold text-agri-forest mb-3">Nearby Agri Services</h3>
              <p className="text-gray-600 mb-4">
                Instantly locate nearby fertilizer vendors, seed suppliers, and Krishi Vigyan Kendras (KVK) using interactive maps and GPS routing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-agri-light py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold text-agri-forest mb-4">Verified Agronomic Data</h2>
            <p className="text-lg text-gray-700 mb-6">
              Our disease treatments and organic remedies are sourced from verified agricultural extension services, ensuring you receive safe and actionable advice for your crops.
            </p>
            <div className="flex items-center space-x-2 text-agri-emerald font-semibold">
              <ShieldCheck className="h-6 w-6" />
              <span>38 Plant Disease Classes Supported</span>
            </div>
          </div>
          <div className="md:w-5/12">
             <img src="/assets/app_logo.png" alt="Smart Agri Logo" className="rounded-2xl shadow-xl w-full max-w-sm mx-auto bg-agri-dark p-8" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
