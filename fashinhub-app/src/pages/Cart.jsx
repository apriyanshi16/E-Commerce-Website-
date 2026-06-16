import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../lib/utils';

const Cart = () => {
  const { user } = useAuth();
  const { cartItems, loading, updateQuantity, removeItem, cartTotal } = useCart();

  if (!user) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Please login to view your cart</h2>
        <Link to="/login" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <Link to="/products" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border p-4 flex gap-4">
                <Link to={`/products/${item.product?.id}`} className="flex-shrink-0">
                  <img
                    src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200&auto=format&fit=crop'}
                    alt={item.product?.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </Link>
                <div className="flex-1">
                  <Link to={`/products/${item.product?.id}`} className="hover:underline">
                    <h3 className="font-medium text-gray-900">{item.product?.name || 'Product'}</h3>
                  </Link>
                  <p className="text-sm text-gray-500">{item.product?.category?.name || 'Fashion'}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="font-semibold text-primary-600">{formatPrice(item.product?.price || 0)}</span>
                    <div className="flex items-center border rounded-lg">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="p-2 hover:bg-gray-100 disabled:opacity-50">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= (item.product?.quantity || 10)} className="p-2 hover:bg-gray-100 disabled:opacity-50">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <span className="font-semibold text-gray-900">{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{cartTotal >= 100 ? 'Free' : formatPrice(10)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal >= 100 ? cartTotal : cartTotal + 10)}</span>
                </div>
              </div>

              <Link to="/checkout" className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>

              <Link to="/products" className="block text-center mt-4 text-primary-600 hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
