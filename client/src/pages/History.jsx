import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Sprout, Microscope, ChevronDown, ChevronUp, Trash2, AlertCircle } from 'lucide-react';

const History = () => {
  const [activeTab, setActiveTab] = useState('disease');
  const [diseaseHistory, setDiseaseHistory] = useState([]);
  const [cropHistory, setCropHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const [diseaseRes, cropRes] = await Promise.all([
        axios.get('/api/disease-detection/history'),
        axios.get('/api/crop-recommendation/history')
      ]);
      setDiseaseHistory(diseaseRes.data.history || []);
      setCropHistory(cropRes.data.history || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const deleteDiseaseItem = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/disease-detection/history/${id}`);
      setDiseaseHistory(diseaseHistory.filter(item => item._id !== id));
      setMessage('Diagnosis record deleted successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const deleteCropItem = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/crop-recommendation/history/${id}`);
      setCropHistory(cropHistory.filter(item => item._id !== id));
      setMessage('Crop recommendation record deleted successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const clearAllHistory = async () => {
    if (!window.confirm(`Are you sure you want to clear all ${activeTab === 'disease' ? 'disease diagnosis' : 'crop recommendation'} logs?`)) return;

    try {
      if (activeTab === 'disease') {
        await axios.delete('/api/disease-detection/history/all');
        setDiseaseHistory([]);
        setMessage('All disease diagnosis history cleared.');
      } else {
        await axios.delete('/api/crop-recommendation/history/all');
        setCropHistory([]);
        setMessage('All crop recommendation history cleared.');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-agri-forest flex items-center justify-center gap-3">
          <Clock className="h-8 w-8 text-agri-emerald" />
          Prediction History
        </h1>
        <p className="text-gray-600 mt-2">Review and manage your past crop recommendations and leaf disease diagnoses.</p>
      </div>

      {message && (
        <div className="max-w-md mx-auto mb-6 bg-emerald-50 text-agri-forest p-3 rounded-lg text-center text-sm font-medium border border-emerald-200">
          {message}
        </div>
      )}

      {/* Tab Header & Action Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="bg-white rounded-xl p-1 shadow-sm border border-emerald-100 inline-flex">
          <button
            onClick={() => setActiveTab('disease')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'disease'
                ? 'bg-agri-emerald text-white shadow-sm'
                : 'text-gray-600 hover:text-agri-forest'
            }`}
          >
            <Microscope className="h-4 w-4" />
            Disease Diagnosis ({diseaseHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('crop')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'crop'
                ? 'bg-agri-emerald text-white shadow-sm'
                : 'text-gray-600 hover:text-agri-forest'
            }`}
          >
            <Sprout className="h-4 w-4" />
            Crop Recommendations ({cropHistory.length})
          </button>
        </div>

        {((activeTab === 'disease' && diseaseHistory.length > 0) ||
          (activeTab === 'crop' && cropHistory.length > 0)) && (
          <button
            onClick={clearAllHistory}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors border border-red-200"
          >
            <Trash2 className="h-4 w-4" /> Clear All History
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-agri-emerald"></div>
        </div>
      ) : (
        <>
          {/* Disease History Tab */}
          {activeTab === 'disease' && (
            <div className="space-y-4">
              {diseaseHistory.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Microscope className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p>No disease diagnoses yet. Upload a leaf image to get started.</p>
                </div>
              ) : (
                diseaseHistory.map((item) => (
                  <div key={item._id} className="card hover:shadow-md transition-shadow">
                    <div
                      className="p-5 flex items-center justify-between cursor-pointer"
                      onClick={() => toggleExpand(item._id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-emerald-50 shrink-0 border border-emerald-100">
                          <img
                            src={item.imageUrl}
                            alt="Leaf"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/assets/disease_banner.png';
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-agri-forest capitalize">
                            {item.diseaseName || item.predictedClass?.replace(/_/g, ' ')}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Crop: <span className="capitalize">{item.cropName}</span> &bull; Confidence: {(item.confidence * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(item.createdAt)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => deleteDiseaseItem(e, item._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete diagnosis"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {expandedId === item._id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {expandedId === item._id && item.advisory && (
                      <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3 animate-fade-in">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="text-sm font-bold text-gray-700 mb-1">Treatment Guidance</h4>
                          <p className="text-sm text-gray-600">{item.advisory.treatment_guidance}</p>
                        </div>
                        <div className="bg-agri-light/40 p-3 rounded-lg">
                          <h4 className="text-sm font-bold text-agri-forest mb-1">Organic Management</h4>
                          <p className="text-sm text-gray-600">{item.advisory.organic_eco_management}</p>
                        </div>
                        <p className="text-xs text-gray-400">
                          Source: {item.advisory.source_name} &bull; Status: {item.advisory.remedy_status}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Crop History Tab */}
          {activeTab === 'crop' && (
            <div className="space-y-4">
              {cropHistory.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Sprout className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p>No crop recommendations yet. Enter soil data to get started.</p>
                </div>
              ) : (
                cropHistory.map((item) => (
                  <div key={item._id} className="card p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-agri-forest capitalize">{item.recommendedCrop}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Confidence: {(item.confidence * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(item.createdAt)}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="bg-agri-light text-agri-forest text-xs font-medium p-3 rounded-lg text-center hidden sm:block">
                          <div className="grid grid-cols-4 gap-x-4 gap-y-1">
                            <span>N: {item.input?.N}</span>
                            <span>P: {item.input?.P}</span>
                            <span>K: {item.input?.K}</span>
                            <span>pH: {item.input?.ph}</span>
                            <span>Temp: {item.input?.temperature}°C</span>
                            <span>Hum: {item.input?.humidity}%</span>
                            <span>Rain: {item.input?.rainfall}mm</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => deleteCropItem(e, item._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete recommendation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default History;
