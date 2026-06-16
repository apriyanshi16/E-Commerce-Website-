import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useProducts = (filters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase.from('products').select('*, category:categories(*)');
      if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
      if (filters.isFeatured) query = query.eq('is_featured', true);
      if (filters.search) query = query.ilike('name', `%${filters.search}%`);
      if (filters.minPrice) query = query.gte('price', filters.minPrice);
      if (filters.maxPrice) query = query.lte('price', filters.maxPrice);
      if (filters.sort === 'price_asc') query = query.order('price', { ascending: true });
      else if (filters.sort === 'price_desc') query = query.order('price', { ascending: false });
      else if (filters.sort === 'rating') query = query.order('rating', { ascending: false });
      else query = query.order('created_at', { ascending: false });
      if (filters.limit) query = query.limit(filters.limit);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return data || [];
    },
  });
};

export const useReviews = (productId) => {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!productId,
  });
};

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, product:products(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
};
