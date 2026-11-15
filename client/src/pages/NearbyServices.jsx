import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Map, MapPin, Navigation, Phone, Search, AlertCircle, LocateFixed } from 'lucide-react';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically update map center when location changes
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const NearbyServices = () => {
  const [location, setLocation] = useState(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState('');
  const [radius, setRadius] = useState(25); // km

  const fetchNearbyStores = async (lat, lng, r) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/nearby?lat=${lat}&lng=${lng}&radius=${r}`);
      setStores(res.data.stores || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch nearby agricultural services.');
    } finally {
      setLoading(false);
    }
  };

  const getGPSLocation = () => {
    setLoading(true);
    setError('');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng, name: 'Current Location' });
          fetchNearbyStores(lat, lng, radius);
        },
        (err) => {
          console.warn("Geolocation blocked or failed. Using default location (Nagpur, India).");
          const defaultLat = 21.1458;
          const defaultLng = 79.0882;
          setLocation({ lat: defaultLat, lng: defaultLng, name: 'Nagpur (Default)' });
          fetchNearbyStores(defaultLat, defaultLng, radius);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

  useEffect(() => {
    getGPSLocation();
  }, []);

  const handleAddressSearch = async (e) => {
    e.preventDefault();
    if (!searchAddress.trim()) return;

    setGeocoding(true);
    setError('');
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}`);
      if (res.data && res.data.length > 0) {
        const place = res.data[0];
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);
        setLocation({ lat, lng, name: place.display_name });
        fetchNearbyStores(lat, lng, radius);
      } else {
        setError(`Could not find coordinates for "${searchAddress}". Please try a different location or city name.`);
      }
    } catch (err) {
      setError('Geocoding error. Please check your network or try again.');
    } finally {
      setGeocoding(false);
    }
  };

  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    if (location) {
      fetchNearbyStores(location.lat, location.lng, newRadius);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 h-[calc(100vh-4rem)] flex flex-col">
      {/* Title Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-agri-forest flex items-center gap-2">
          <Map className="h-8 w-8 text-agri-emerald" />
          Nearby Agricultural Services
        </h1>
        <p className="text-gray-600 mt-1">Locate fertilizer vendors, seed suppliers, and KVK centers by GPS or manual search.</p>
      </div>

      {/* Dual Search Controls (GPS + Address Input + Radius) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Manual Address Input Form */}
        <form onSubmit={handleAddressSearch} className="flex-grow flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-grow">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Enter city, town, or pincode (e.g. Nagpur, Pune)..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-agri-emerald focus:border-agri-emerald"
            />
          </div>
          <button
            type="submit"
            disabled={geocoding}
            className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5 shrink-0"
          >
            <Search className="h-4 w-4" />
            {geocoding ? 'Searching...' : 'Search Location'}
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
          {/* Use GPS Button */}
          <button
            onClick={getGPSLocation}
            className="btn-outline py-2 px-3 text-sm flex items-center gap-1.5 shrink-0 bg-agri-light/50"
            title="Use current GPS location"
          >
            <LocateFixed className="h-4 w-4 text-agri-emerald" />
            Use GPS Location
          </button>

          {/* Radius Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs text-gray-600 font-semibold">Radius:</label>
            <select 
              value={radius} 
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="border-gray-300 rounded-lg text-sm focus:ring-agri-emerald focus:border-agri-emerald p-2 bg-gray-50"
            >
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
        {/* Store List Sidebar */}
        <div className="lg:w-1/3 bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-y-auto p-4 flex flex-col">
          <div className="sticky top-0 bg-white z-10 pb-2 border-b mb-3">
            <h2 className="font-bold text-lg text-gray-800">
              {stores.length} Services Found
            </h2>
            {location && (
              <p className="text-xs text-agri-emerald font-medium truncate mt-0.5">
                Around: {location.name || `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`}
              </p>
            )}
          </div>
          
          {loading ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agri-emerald"></div>
            </div>
          ) : stores.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-gray-500 p-8 text-center">
              <MapPin className="h-12 w-12 mb-3 opacity-20" />
              <p>No agricultural services found within {radius}km of this location.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stores.map((store, index) => (
                <div key={store.id || index} className="p-4 rounded-xl border border-gray-100 hover:border-agri-mint hover:shadow-md transition-all bg-gray-50 hover:bg-white group cursor-pointer">
                  <h3 className="font-bold text-agri-forest group-hover:text-agri-emerald transition-colors">{store.name}</h3>
                  <span className="inline-block px-2 py-1 bg-agri-light text-agri-forest text-xs rounded-full font-medium mt-2 mb-3">
                    {store.type}
                  </span>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-start gap-2">
                      <Navigation className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" />
                      <span>{store.address} <br/><span className="text-agri-emerald font-semibold">{store.distanceKm} km away</span></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {store.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaflet Map */}
        <div className="lg:w-2/3 rounded-2xl overflow-hidden shadow-sm border border-emerald-100 bg-gray-100 z-0 relative min-h-[400px]">
          {location ? (
            <MapContainer center={[location.lat, location.lng]} zoom={11} style={{ height: '100%', width: '100%' }}>
              <ChangeView center={[location.lat, location.lng]} zoom={11} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* User Marker */}
              <Marker position={[location.lat, location.lng]}>
                <Popup>
                  <div className="font-semibold text-agri-forest">
                    {location.name || 'Selected Location'}
                  </div>
                </Popup>
              </Marker>

              {/* Store Markers */}
              {stores.map((store, index) => (
                <Marker key={store.id || index} position={[store.lat, store.lng]}>
                  <Popup>
                    <div className="p-1">
                      <h4 className="font-bold text-agri-forest text-sm mb-1">{store.name}</h4>
                      <p className="text-xs text-gray-600 mb-2">{store.type}</p>
                      <p className="text-xs font-semibold text-agri-emerald">{store.distanceKm} km away</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-agri-light/50">
              <p className="text-agri-forest font-medium flex items-center gap-2 animate-pulse">
                <MapPin className="h-5 w-5" /> Acquiring Location...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NearbyServices;
