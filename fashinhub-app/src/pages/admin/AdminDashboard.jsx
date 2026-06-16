import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice, formatDate } from '../../lib/utils';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        supabase.from('orders').select('total'),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('users').select('id', { count: 'exact' }),
      ]);
      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      setStats({ totalRevenue, totalOrders: ordersRes.data?.length || 0, totalProducts: productsRes.count || 0, totalUsers: usersRes.count || 0 });
      const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5);
      setRecentOrders(orders || []);
      const { data: products } = await supabase.from('products').select('*').limit(5);
      setTopProducts(products || []);
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  const getStatusColor = (status) => {
    const colors = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'bg-green-500' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-purple-500' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-orange-500' },
  ];

  if (loading) return <div className="animate-pulse space-y-6"><div className="grid grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl p-6 h-24" />)}</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Dashboard</h1><p className="text-gray-500">Welcome to your admin dashboard</p></div>
        <div className="text-sm text-gray-500">Last updated: {formatDate(new Date())}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (<div key={i} className="bg-white rounded-xl border p-6"><div className="flex items-center justify-between mb-4"><div className={`p-3 rounded-lg ${stat.color}`}><stat.icon className="w-6 h-6 text-white" /></div></div><p className="text-2xl font-bold text-gray-900">{stat.value}</p><p className="text-gray-500">{stat.label}</p></div>))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border">
          <div className="p-6 border-b flex items-center justify-between"><h2 className="font-semibold">Recent Orders</h2><Link to="/admin/orders" className="text-primary-600 text-sm hover:underline flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></Link></div>
          <div className="divide-y">{recentOrders.length === 0 ? <p className="p-6 text-gray-500 text-center">No orders yet</p> : recentOrders.map((order) => (<div key={order.id} className="p-4 flex items-center justify-between"><div><p className="font-medium">{order.order_number}</p><p className="text-sm text-gray-500">{formatDate(order.created_at)}</p></div><div className="text-right"><p className="font-semibold">{formatPrice(order.total)}</p><span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(order.status)}`}>{order.status}</span></div></div>))}</div>
        </div>
        <div className="bg-white rounded-xl border">
          <div className="p-6 border-b flex items-center justify-between"><h2 className="font-semibold">Products</h2><Link to="/admin/products" className="text-primary-600 text-sm hover:underline flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></Link></div>
          <div className="divide-y">{topProducts.length === 0 ? <p className="p-6 text-gray-500 text-center">No products yet</p> : topProducts.map((product) => (<div key={product.id} className="p-4 flex items-center gap-4"><img src={product.images?.[0] || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&auto=format&fit=crop'} alt={product.name} className="w-12 h-12 object-cover rounded-lg" /><div className="flex-1"><p className="font-medium">{product.name}</p><p className="text-sm text-gray-500">{formatPrice(product.price)}</p></div><span className={`text-xs px-2 py-1 rounded-full ${product.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}</span></div>))}</div>
        </div>
      </div>
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/products" className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50"><Package className="w-8 h-8 text-primary-600" /><span className="text-sm font-medium">Add Product</span></Link>
          <Link to="/admin/orders" className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50"><ShoppingCart className="w-8 h-8 text-primary-600" /><span className="text-sm font-medium">View Orders</span></Link>
          <Link to="/admin/users" className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50"><Users className="w-8 h-8 text-primary-600" /><span className="text-sm font-medium">Manage Users</span></Link>
          <Link to="/" className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50"><TrendingUp className="w-8 h-8 text-primary-600" /><span className="text-sm font-medium">View Store</span></Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
