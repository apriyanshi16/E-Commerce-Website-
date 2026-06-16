import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatPrice, getDiscountPercent } from '../../lib/utils';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemId } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [adding, setAdding] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const discount = getDiscountPercent(product.compare_at_price, product.price);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { alert('Please login'); return; }
    setAdding(true);
    await addToCart(product.id, 1);
    setAdding(false);
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { alert('Please login'); return; }
    if (inWishlist) {
      const itemId = getWishlistItemId(product.id);
      if (itemId) await removeFromWishlist(itemId);
    } else {
      await addToWishlist(product.id);
    }
  };

  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&auto=format&fit=crop';

  return (
    <Link to={`/products/${product.id}`} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">-{discount}%</span>}
          {product.is_featured && <span className="px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded">Featured</span>}
        </div>
        <button onClick={handleToggleWishlist} className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${inWishlist ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'}`}>
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
        <div className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button onClick={handleAddToCart} disabled={adding} className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-100 disabled:opacity-50">
            <ShoppingCart className="w-4 h-4" />
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.category?.name || 'Fashion'}</p>
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`w-3.5 h-3.5 ${star <= Math.round(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviews_count || 0})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary-600">{formatPrice(product.price)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
