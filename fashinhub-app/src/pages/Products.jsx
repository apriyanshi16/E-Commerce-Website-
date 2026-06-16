import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import ProductCard from '../components/shared/ProductCard';
import { useProducts, useCategories } from '../hooks/useData';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters = {
    categoryId: selectedCategory || undefined,
    search: searchParams.get('search') || undefined,
    minPrice: priceRange.min ? Number(priceRange.min) : undefined,
    maxPrice: priceRange.max ? Number(priceRange.max) : undefined,
    sort: sortBy,
    limit: 24,
  };

  const { products, loading, error } = useProducts(filters);
  const { categories } = useCategories();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) setSearchParams({ search: searchInput.trim() });
  };

  const clearFilters = () => {
    setSearchInput('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
    setSearchParams({});
  };

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setSearchParams(catId ? { category: catId } : {});
  };

  const pageTitle = searchParams.get('search')
    ? `Search results for "${searchParams.get('search')}"`
    : selectedCategory
    ? categories?.find(c => c.id === selectedCategory)?.name || 'Products'
    : 'All Products';

  const activeFilters = [searchParams.get('search'), selectedCategory, priceRange.min, priceRange.max].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="bg-white rounded-xl border p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {activeFilters > 0 && <button onClick={clearFilters} className="text-sm text-primary-600 hover:underline">Clear all</button>}
      </div>

      <form onSubmit={handleSearch} className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </form>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Category</label>
        <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">All Categories</option>
          {categories?.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Price Range</label>
        <div className="flex gap-2">
          <input type="number" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} placeholder="Min" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          <span className="text-gray-400">-</span>
          <input type="number" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} placeholder="Max" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Sort By</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0"><FilterPanel /></aside>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 hidden md:block">{products.length} products</span>
                <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  Filters
                  {activeFilters > 0 && <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">{activeFilters}</span>}
                </button>
              </div>
            </div>
            {mobileFiltersOpen && <div className="lg:hidden mb-6"><FilterPanel /></div>}
            {error && <div className="text-center py-12 text-red-500">Error loading products. Please try again.</div>}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array(8).fill(0).map((_, i) => (<div key={i} className="bg-white rounded-xl p-4 border"><div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4 animate-pulse" /><div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" /><div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" /></div>))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">No products found</h2>
                <p className="text-gray-500 mb-4">Try adjusting your search or filters.</p>
                <button onClick={clearFilters} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (<ProductCard key={product.id} product={product} />))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
