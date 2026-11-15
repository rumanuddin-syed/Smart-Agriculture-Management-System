import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

const categories = ['Vegetables', 'Fruits', 'Grains & Cereals', 'Pulses', 'Spices', 'Dairy', 'Other'];
const units = ['kg', 'gram', 'quintal', 'litre', 'piece', 'bundle'];

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    description: '',
    pricePerUnit: '',
    unit: 'kg',
    stock: '',
    minOrderQty: 1,
    maxOrderQty: 1000,
    isOrganic: true,
    farmingMethod: 'organic',
    freshnessDuration: '3-5 days',
    village: '',
    district: '',
    state: '',
    pincode: ''
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      axios
        .get(`/api/marketplace/products/${id}`)
        .then((res) => {
          const p = res.data.product;
          setFormData({
            name: p.name || '',
            category: p.category || 'Vegetables',
            description: p.description || '',
            pricePerUnit: p.pricePerUnit || '',
            unit: p.unit || 'kg',
            stock: p.stock || '',
            minOrderQty: p.minOrderQty || 1,
            maxOrderQty: p.maxOrderQty || 1000,
            isOrganic: p.isOrganic ?? true,
            farmingMethod: p.farmingMethod || 'organic',
            freshnessDuration: p.freshnessDuration || '3-5 days',
            village: p.location?.village || '',
            district: p.location?.district || '',
            state: p.location?.state || '',
            pincode: p.location?.pincode || ''
          });
          setExistingImages(p.images || []);
        })
        .catch((err) => console.error(err));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          data.append('images', imageFiles[i]);
        }
      }

      if (isEdit) {
        await axios.put(`/api/marketplace/farmer/products/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/api/marketplace/farmer/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate('/farmer/products');
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'Error saving produce listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/farmer/products"
        className="inline-flex items-center gap-1 text-xs font-semibold text-agri-emerald hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to My Products</span>
      </Link>

      <div className="card p-8 border border-emerald-100 shadow-sm">
        <h1 className="text-2xl font-extrabold text-agri-forest mb-2">
          {isEdit ? 'Edit Produce Listing' : 'Publish New Farm Produce'}
        </h1>
        <p className="text-xs text-gray-500 mb-8">
          Fill in accurate details regarding your harvest to attract direct consumer orders.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Produce Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Organic Red Tomatoes"
                className="input-field text-xs py-2"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field text-xs py-2"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe farming techniques, variety, freshness, and packaging..."
              className="input-field text-xs py-2"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Price per Unit (₹) *</label>
              <input
                type="number"
                name="pricePerUnit"
                required
                min="0.5"
                step="any"
                value={formData.pricePerUnit}
                onChange={handleChange}
                placeholder="40"
                className="input-field text-xs py-2"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Unit Type *</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="input-field text-xs py-2"
              >
                {units.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Available Stock *</label>
              <input
                type="number"
                name="stock"
                required
                min="0"
                value={formData.stock}
                onChange={handleChange}
                placeholder="100"
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Freshness / Shelf Life</label>
              <input
                type="text"
                name="freshnessDuration"
                value={formData.freshnessDuration}
                onChange={handleChange}
                placeholder="e.g. 5-7 days"
                className="input-field text-xs py-2"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 font-semibold text-agri-forest cursor-pointer bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 w-full">
                <input
                  type="checkbox"
                  name="isOrganic"
                  checked={formData.isOrganic}
                  onChange={handleChange}
                  className="rounded text-agri-emerald focus:ring-agri-emerald"
                />
                <span>🌿 100% Certified Organic Harvest</span>
              </label>
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Upload Produce Images (Up to 5)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImageFiles(Array.from(e.target.files))}
              className="text-xs file:btn-primary file:py-1.5 file:px-3 file:text-xs file:mr-3"
            />
            {existingImages.length > 0 && (
              <div className="flex gap-2 mt-2">
                {existingImages.map((img, i) => (
                  <img key={i} src={img} alt="preview" className="h-12 w-12 rounded object-cover border" />
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Link to="/farmer/products" className="btn-outline text-xs py-2.5 px-4">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs py-2.5 px-6"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Produce' : 'Publish to Marketplace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;

