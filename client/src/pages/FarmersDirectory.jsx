import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Users, MapPin, Store, ChevronRight, ShieldCheck } from 'lucide-react';

const FarmersDirectory = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/marketplace/farmers')
      .then((res) => setFarmers(res.data.farmers || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-agri-forest">Farmers Directory</h1>
        <p className="text-sm text-gray-600 mt-1">
          Connect directly with verified independent cultivators across multiple districts.
        </p>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-emerald"></div>
        </div>
      ) : farmers.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          No registered farmers found at this moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmers.map((farmer) => (
            <div key={farmer.id} className="card p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-agri-forest flex items-center justify-center text-2xl font-bold">
                    {farmer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-agri-forest">{farmer.farmName}</h3>
                    <p className="text-xs text-gray-500 font-medium">{farmer.name}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-agri-emerald mr-1" />
                      <span>{farmer.district}, {farmer.state}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                  {farmer.farmDescription}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 bg-agri-light/60 p-2.5 rounded-lg mb-4">
                  <span>Method: <strong className="capitalize text-agri-forest">{farmer.farmingMethod}</strong></span>
                  <span>Active Listings: <strong className="text-agri-emerald">{farmer.activeProductsCount} items</strong></span>
                </div>
              </div>

              <Link
                to={`/marketplace/farmers/${farmer.id}`}
                className="btn-outline text-xs w-full py-2 flex items-center justify-center gap-1 text-center"
              >
                <span>Visit Farm Profile</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmersDirectory;

