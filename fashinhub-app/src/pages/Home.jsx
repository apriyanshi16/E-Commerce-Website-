import { Link } from 'react-router-dom';
import { ArrowRight, Zap, TrendingUp, Star, Percent } from 'lucide-react';
import ProductCard from '../components/shared/ProductCard';
import { useProducts, useCategories } from '../hooks/useData';

const Home = () => {
  const { products: featuredProducts, loading: loadingFeatured } = useProducts({ isFeatured: true, limit: 4 });
  const { products: allProducts, loading: loadingAll } = useProducts({ limit: 8 });
  const { categories, loading: loadingCategories } = useCategories();

  const deals = allProducts.filter(p => p.compare_at_price && p.compare_at_price > p.price).slice(0, 4);
  const newArrivals = allProducts.slice(0, 4);

  const categoryImages = {
    'Men': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop',
    'Women': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop',
    'Shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
    'Accessories': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&auto=format&fit=crop',
    'Bags': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop',
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&auto=format&fit=crop" alt="Fashion" className="w-full h-full object-cover opacity-50" />
        </div>
        <div className="relative h-full container flex items-center">
          <div className="max-w-2xl text-white">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-medium mb-6">New Collection 2024</span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              Elevate Your<span className="block text-primary-400">Everyday Style</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-lg">Discover the latest trends in fashion. Premium quality clothing and accessories for every occasion.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">Shop Now <ArrowRight className="w-5 h-5" /></Link>
              <Link to="/products?featured=true" className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-lg hover:bg-white/20 transition-colors">View Featured</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Shop by Category</h2>
            <Link to="/products" className="flex items-center gap-1 text-primary-600 font-medium hover:underline">View All <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loadingCategories ? Array(4).fill(0).map((_, i) => <div key={i} className="aspect-[3/4] bg-gray-100 rounded-xl animate-pulse" />) : categories?.slice(0, 4).map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.id}`} className="group relative aspect-[3/4] overflow-hidden rounded-xl">
                <img src={categoryImages[cat.name] || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&auto=format&fit=crop'} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Collection</p>
                  <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Deals */}
      <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500 text-white rounded-full"><Zap className="w-6 h-6" /></div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Deals of the Day</h2>
                <p className="text-gray-600">Up to 50% off on selected items</p>
              </div>
            </div>
            <Link to="/products?deals=true" className="flex items-center gap-1 text-red-600 font-medium hover:underline">View All <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(loadingAll ? Array(4).fill(null) : deals).map((product, i) => product?.id ? <ProductCard key={product.id} product={product} /> : <div key={i} className="bg-white rounded-xl p-4 animate-pulse"><div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4" /><div className="h-4 bg-gray-200 rounded mb-2" /><div className="h-4 bg-gray-200 rounded w-2/3" /></div>)}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 text-primary-600 rounded-full"><TrendingUp className="w-6 h-6" /></div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">New Arrivals</h2>
            </div>
            <Link to="/products" className="flex items-center gap-1 text-primary-600 font-medium hover:underline">View All <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(loadingAll ? Array(4).fill(null) : newArrivals).map((product, i) => product?.id ? <ProductCard key={product.id} product={product} /> : <div key={i} className="bg-white rounded-xl p-4 border animate-pulse"><div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4" /><div className="h-4 bg-gray-200 rounded mb-2" /><div className="h-4 bg-gray-200 rounded w-2/3" /></div>)}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full"><Star className="w-6 h-6" /></div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
            </div>
            <Link to="/products?featured=true" className="flex items-center gap-1 text-primary-600 font-medium hover:underline">View All <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(loadingFeatured ? Array(4).fill(null) : featuredProducts).map((product, i) => product?.id ? <ProductCard key={product.id} product={product} /> : <div key={i} className="bg-white rounded-xl p-4 border animate-pulse"><div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4" /><div className="h-4 bg-gray-200 rounded mb-2" /><div className="h-4 bg-gray-200 rounded w-2/3" /></div>)}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container text-center">
          <Percent className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get 20% Off Your First Order</h2>
          <p className="text-lg text-primary-100 mb-6 max-w-2xl mx-auto">Sign up for our newsletter and receive a special discount code for your first purchase.</p>
          <Link to="/register" className="inline-block px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">Sign Up Now</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
