import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../lib/utils';

const Wishlist = () => {
  const { user } = useAuth();
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!user) {
    return (
      <div className="container py-16 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Please login to view your wishlist</h2>
        <Link to="/login" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl" style={{ aspectRatio: '3/4' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container py-16 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
        <Link to="/products" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Browse Products</Link>
      </div>
    );
  }

  const handleAddToCart = async (productId) => {
    await addToCart(productId, 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Wishlist</h1>
          <span className="text-gray-500">{wishlistItems.length} items</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border overflow-hidden group">
              <Link to={`/products/${item.product?.id}`} className="block relative" style={{ aspectRatio: '3/4' }}>
                <img src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&auto=format&fit=crop'} alt={item.product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </Link>
              <div className="p-4">
                <Link to={`/products/${item.product?.id}`} className="block">
                  <h3 className="font-medium text-gray-900 line-clamp-1 mb-1 hover:underline">{item.product?.name || 'Product'}</h3>
                </Link>
                <p className="text-lg font-semibold text-primary-600">{formatPrice(item.product?.price || 0)}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleAddToCart(item.product?.id)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                    <ShoppingCart className="w-4 h-4" />Add to Cart
                  </button>
                  <button onClick={() => removeFromWishlist(item.id)} className="p-2 border rounded-lg text-gray-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
