import { useState } from 'react';
import axios from 'axios';
import { Sprout, CheckCircle2, AlertCircle } from 'lucide-react';

const CropRecommendation = () => {
  const [formData, setFormData] = useState({
    N: '', P: '', K: '',
    temperature: '', humidity: '', ph: '', rainfall: ''
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axios.post('/api/crop-recommendation/recommend', formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-agri-forest flex items-center justify-center gap-3">
          <Sprout className="h-8 w-8 text-agri-emerald" />
          Soil-Based Crop Recommendation
        </h1>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
          Enter your soil's N-P-K values and environmental conditions to get an AI-driven crop planting recommendation tailored to your specific field.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* NPK Values */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nitrogen (N)</label>
              <input type="number" name="N" required value={formData.N} onChange={handleChange} className="input-field" placeholder="Ratio (e.g. 90)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phosphorus (P)</label>
              <input type="number" name="P" required value={formData.P} onChange={handleChange} className="input-field" placeholder="Ratio (e.g. 42)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Potassium (K)</label>
              <input type="number" name="K" required value={formData.K} onChange={handleChange} className="input-field" placeholder="Ratio (e.g. 43)" />
            </div>
            
            {/* Environmental */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
              <input type="number" step="0.1" name="temperature" required value={formData.temperature} onChange={handleChange} className="input-field" placeholder="e.g. 25.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Humidity (%)</label>
              <input type="number" step="0.1" name="humidity" required value={formData.humidity} onChange={handleChange} className="input-field" placeholder="e.g. 80.2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Soil pH</label>
              <input type="number" step="0.1" name="ph" required value={formData.ph} onChange={handleChange} className="input-field" placeholder="e.g. 6.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rainfall (mm)</label>
              <input type="number" step="0.1" name="rainfall" required value={formData.rainfall} onChange={handleChange} className="input-field" placeholder="e.g. 200.5" />
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto md:px-12 py-3 text-lg">
              {loading ? 'Analyzing Soil Data...' : 'Get Recommendation'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-10 animate-fade-in-up">
          <div className="bg-gradient-to-br from-agri-emerald to-agri-forest p-1 rounded-2xl shadow-lg">
            <div className="bg-white rounded-xl p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sprout className="h-32 w-32" />
              </div>
              <CheckCircle2 className="h-16 w-16 text-agri-mint mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Recommended Crop</h2>
              <p className="text-5xl font-extrabold text-agri-forest capitalize mb-4">
                {result.recommendedCrop}
              </p>
              <div className="inline-block bg-agri-light text-agri-forest px-4 py-2 rounded-full font-medium">
                AI Confidence: {(result.confidence * 100).toFixed(1)}%
              </div>
              
              <div className="mt-8 border-t border-gray-100 pt-6">
                <p className="text-gray-500 text-sm">
                  This recommendation has been automatically saved to your history logs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropRecommendation;
