import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchCart();
    else { setItems([]); setLoading(false); }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*, category:categories(*))')
      .eq('user_id', user.id);
    setItems(data || []);
    setLoading(false);
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) return { error: 'Please login' };
    const existing = items.find(i => i.product_id === productId);
    if (existing) {
      await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({ user_id: user.id, product_id: productId, quantity });
    }
    await fetchCart();
    return { success: true };
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) return removeItem(itemId);
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    await fetchCart();
  };

  const removeItem = async (itemId) => {
    await supabase.from('cart_items').delete().eq('id', itemId);
    await fetchCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    await fetchCart();
  };

  const cartTotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems: items, loading, addToCart, updateQuantity, removeItem, clearCart, cartTotal, cartCount, refetch: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
