import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Minus, Plus, Heart, Share2, ShoppingCart, Check, ChevronRight } from 'lucide-react';
import { useProduct, useReviews, useProducts } from '../hooks/useData';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { formatPrice, getDiscountPercent } from '../lib/utils';
import ProductCard from '../components/shared/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);
  const { reviews } = useReviews(id);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemId } = useWishlist();
  const { products: relatedProducts } = useProducts({ categoryId: product?.category_id, limit: 4 });

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  if (loading) return <div className="container py-8"><div className="animate-pulse grid md:grid-cols-2 gap-12"><div className="aspect-square bg-gray-200 rounded-xl" /><div className="space-y-4"><div className="h-8 bg-gray-200 rounded" /><div className="h-6 bg-gray-200 rounded w-1/2" /></div></div></div>;
  if (error || !product) return <div className="container py-16 text-center"><h2 className="text-xl font-semibold mb-4">Product not found</h2><Link to="/products" className="text-primary-600 hover:underline">Back to products</Link></div>;

  const images = product.images?.length > 0 ? product.images : ['https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&auto=format&fit=crop'];
  const discount = getDiscountPercent(product.compare_at_price, product.price);
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async () => {
    if (!user) { alert('Please login'); return; }
    setAdding(true);
    await addToCart(product.id, quantity);
    setAdding(false);
  };

  const handleToggleWishlist = async () => {
    if (!user) { alert('Please login'); return; }
    if (inWishlist) { const itemId = getWishlistItemId(product.id); if (itemId) await removeFromWishlist(itemId); }
    else await addToWishlist(product.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-primary-600">Home</Link><ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-primary-600">Products</Link><ChevronRight className="w-4 h-4" />
          {product.category && <><Link to={`/products?category=${product.category.id}`} className="hover:text-primary-600">{product.category.name}</Link><ChevronRight className="w-4 h-4" /></>}
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-xl overflow-hidden border"><img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" /></div>
            {images.length > 1 && <div className="flex gap-2 overflow-x-auto pb-2">{images.map((img, i) => (<button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImage === i ? 'border-primary-600' : 'border-transparent'}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>))}</div>}
          </div>

          <div className="space-y-6">
            <div>
              {product.category && <p className="text-sm text-primary-600 font-medium mb-2">{product.category.name}</p>}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-2">
                <div className="flex">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={`w-5 h-5 ${star <= Math.round(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />))}</div>
                <span className="text-gray-500">{product.rating?.toFixed(1) || '0.0'} ({product.reviews_count || 0} reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary-600">{formatPrice(product.price)}</span>
              {product.compare_at_price && product.compare_at_price > product.price && (<><span className="text-xl text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span><span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-medium rounded">{discount}% OFF</span></>)}
            </div>

            <p className="text-gray-600">{product.description || 'No description available.'}</p>

            <div className="flex items-center gap-2">
              {product.quantity > 0 ? (<><Check className="w-5 h-5 text-green-500" /><span className="text-green-600 font-medium">In Stock ({product.quantity} available)</span></>) : <span className="text-red-600 font-medium">Out of Stock</span>}
            </div>

            {product.quantity > 0 && (
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-100" disabled={quantity <= 1}><Minus className="w-4 h-4" /></button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))} className="p-3 hover:bg-gray-100" disabled={quantity >= product.quantity}><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button onClick={handleAddToCart} disabled={adding || product.quantity === 0} className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50"><ShoppingCart className="w-5 h-5" />{adding ? 'Adding...' : 'Add to Cart'}</button>
              <button onClick={handleToggleWishlist} className={`p-4 border rounded-lg transition-colors ${inWishlist ? 'bg-red-50 border-red-300 text-red-500' : 'hover:bg-gray-50 text-gray-700'}`}><Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} /></button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 text-gray-700"><Share2 className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t pt-12">
          <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold mb-4">Reviews</h3>
              <div className="md:col-span-2 space-y-4">
                {reviews.length === 0 ? <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed"><p className="text-gray-500">No reviews yet. Be the first to review!</p></div> : reviews.map((review) => (<div key={review.id} className="bg-white rounded-xl border p-6"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"><span className="text-sm font-medium text-gray-600">U</span></div><div><p className="font-medium">User</p><div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />))}</div></div></div></div>{review.title && <h4 className="font-medium mb-1">{review.title}</h4>}{review.comment && <p className="text-gray-600">{review.comment}</p>}</div>))}
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.filter(p => p.id !== product.id).slice(0, 4).map((p) => (<ProductCard key={p.id} product={p} />))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
