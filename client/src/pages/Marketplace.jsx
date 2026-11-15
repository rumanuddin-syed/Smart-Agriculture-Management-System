import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import {
  Search,
  ShoppingBag,
  CheckCircle2,
  Sparkles,
  MapPin,
  Store,
  Layers
} from 'lucide-react';

const categories = [
  'All',
  'Vegetables',
  'Fruits',
  'Grains & Cereals',
  'Pulses',
  'Spices',
  'Dairy'
];

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const limit = 12;

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [toastMessage, setToastMessage] = useState('');

  const { addToCart } = useCart();

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setLoading(true);

      try {
        const params = {
          page,
          limit,
          sortBy
        };

        if (appliedSearch) {
          params.search = appliedSearch;
        }

        if (selectedCategory !== 'All') {
          params.category = selectedCategory;
        }

        if (organicOnly) {
          params.isOrganic = true;
        }

        const res = await axios.get('/api/marketplace/products', {
          params
        });

        if (cancelled) return;

        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
        setPages(Math.max(1, res.data.pages || 1));
      } catch (err) {
        if (cancelled) return;

        console.error('Error fetching products:', err);
        setProducts([]);
        setTotal(0);
        setPages(1);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [appliedSearch, selectedCategory, organicOnly, sortBy, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  };

  const handleCategoryChange = (category) => {
    setPage(1);
    setSelectedCategory(category);
  };

  const handleOrganicChange = (checked) => {
    setPage(1);
    setOrganicOnly(checked);
  };

  const handleSortChange = (value) => {
    setPage(1);
    setSortBy(value);
  };

  const handleResetFilters = () => {
    setSearch('');
    setAppliedSearch('');
    setSelectedCategory('All');
    setOrganicOnly(false);
    setSortBy('newest');
    setPage(1);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);

    setToastMessage(`Added "${product.name}" to cart!`);

    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const Pagination = () => {
    if (pages <= 1) return null;

    return (
      <div className="flex flex-wrap justify-center items-center mt-8 gap-4">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1 || loading}
          className="btn-outline disabled:opacity-50"
        >
          Prev
        </button>

        <span className="text-sm text-gray-600">
          Page {page} of {pages} (Total {total} items)
        </span>

        <button
          type="button"
          onClick={() => setPage((p) => Math.min(p + 1, pages))}
          disabled={page === pages || loading}
          className="btn-outline disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-agri-light/50 py-8">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-agri-forest text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-agri-mint" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-agri-emerald to-agri-forest rounded-3xl p-8 md:p-12 text-white shadow-sm mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Farm Direct to Kitchen
            </span>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              Fresh Harvest, Directly from Local Farmers.
            </h1>

            <p className="text-emerald-50 text-base md:text-lg mb-6 leading-relaxed">
              Support local agriculture by buying grains, vegetables,
              fruits, and spices straight from the cultivators.
              Transparent pricing, zero middleman markups.
            </p>

            {/* Search form */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex gap-2 max-w-lg bg-white p-2 rounded-2xl shadow-lg"
            >
              <div className="flex-1 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400 mr-2" />

                <input
                  type="text"
                  placeholder="Search tomatoes, basmati rice, mangoes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-agri-dark focus:outline-none text-sm"
                />
              </div>

              <button
                type="submit"
                className="btn-primary text-sm rounded-xl py-2 px-5"
              >
                Search
              </button>
            </form>
          </div>

          <div className="absolute right-0 bottom-0 opacity-15 translate-x-10 translate-y-10 pointer-events-none">
            <Store className="h-96 w-96 text-white" />
          </div>
        </div>

        {/* Filter toolbar */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm mb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" />
                Categories:
              </span>

              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all ${selectedCategory === cat
                      ? 'bg-agri-emerald text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-agri-emerald'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Organic and sort controls */}
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center space-x-2 text-xs font-semibold text-agri-forest cursor-pointer bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <input
                  type="checkbox"
                  checked={organicOnly}
                  onChange={(e) => handleOrganicChange(e.target.checked)}
                  className="rounded text-agri-emerald focus:ring-agri-emerald"
                />

                <span>🌿 100% Organic Only</span>
              </label>

              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 font-medium focus:outline-none focus:border-agri-emerald"
              >
                <option value="newest">Sort: Newly Harvested</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-emerald mb-4" />

            <p className="text-sm text-gray-500 font-medium">
              Gathering farm-fresh produce...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="card p-12 text-center max-w-md mx-auto my-12">
            <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />

            <h3 className="text-lg font-bold text-agri-forest mb-2">
              No Produce Found
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              Try adjusting your category filter, clearing your search
              query, or checking back soon.
            </p>

            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-outline text-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-500 mb-4">
              Showing {products.length} of {total} products
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="card flex flex-col hover:shadow-lg transition-all duration-300 border border-emerald-100 group"
                >
                  {/* Product image and badges */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={
                        product.images?.[0] ||
                        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {product.isOrganic && (
                      <span className="absolute top-3 left-3 bg-agri-forest/90 backdrop-blur-sm text-agri-mint text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                        🌿 Organic Certified
                      </span>
                    )}

                    <span className="absolute top-3 right-3 bg-white/95 text-agri-forest text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                      {product.category}
                    </span>
                  </div>

                  {/* Product details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center text-xs text-gray-500 mb-1.5">
                        <MapPin className="h-3.5 w-3.5 text-agri-emerald mr-1 flex-shrink-0" />

                        <span className="truncate">
                          {product.farmerInfo?.farmName ||
                            product.farmerInfo?.name ||
                            'Local Farmer'}{' '}
                          (
                          {product.farmerInfo?.district ||
                            product.location?.district ||
                            'Direct Farm'}
                          )
                        </span>
                      </div>

                      <Link to={`/marketplace/product/${product._id}`}>
                        <h3 className="font-bold text-base text-agri-forest hover:text-agri-emerald transition-colors line-clamp-2 mb-2">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Price and stock */}
                      <div className="flex flex-wrap items-baseline gap-2 mb-3">
                        <span className="text-2xl font-black text-agri-forest">
                          ₹{product.pricePerUnit}
                        </span>

                        <span className="text-xs text-gray-500 font-medium">
                          / {product.unit}
                        </span>

                        {product.stock <= 10 && product.stock > 0 && (
                          <span className="ml-auto text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                            Only {product.stock} left
                          </span>
                        )}

                        {product.stock === 0 && (
                          <span className="ml-auto text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                            Out of stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                      <Link
                        to={`/marketplace/product/${product._id}`}
                        className="btn-outline flex-1 py-2 text-xs text-center"
                      >
                        Details
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                        className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5 disabled:bg-gray-300"
                        title="Add to Shopping Cart"
                      >
                        <ShoppingBag className="h-4 w-4" />

                        <span>
                          {product.stock <= 0 ? 'Sold Out' : 'Add'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination: one instance, outside the product grid */}
        {!loading && products.length > 0 && <Pagination />}
      </div>
    </div>
  );
};

export default Marketplace;