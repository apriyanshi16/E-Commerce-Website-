import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchWishlist();
    else { setItems([]); setLoading(false); }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('wishlist_items')
      .select('*, product:products(*, category:categories(*))')
      .eq('user_id', user.id);
    setItems(data || []);
    setLoading(false);
  };

  const addToWishlist = async (productId) => {
    if (!user) return { error: 'Please login' };
    await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: productId });
    await fetchWishlist();
  };

  const removeFromWishlist = async (itemId) => {
    await supabase.from('wishlist_items').delete().eq('id', itemId);
    await fetchWishlist();
  };

  const isInWishlist = (productId) => items.some(i => i.product_id === productId);
  const getWishlistItemId = (productId) => items.find(i => i.product_id === productId)?.id;

  return (
    <WishlistContext.Provider value={{
      wishlistItems: items, loading, addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemId, refetch: fetchWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
