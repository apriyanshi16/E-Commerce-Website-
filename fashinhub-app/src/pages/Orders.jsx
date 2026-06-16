import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useData';
import { formatPrice, formatDate } from '../lib/utils';

const Orders = () => {
  const { user } = useAuth();
  const { orders, loading } = useOrders();

  if (!user) {
    return (
      <div className="container py-16 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Please login to view your orders</h2>
        <Link to="/login" className="text-primary-600 hover:underline">Sign In</Link>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <Link to="/products" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="block bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Order #{order.order_number}</p>
                    <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="font-semibold text-primary-600">{formatPrice(order.total)}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  {order.order_items?.slice(0, 4).map((item, i) => (
                    <div key={i} className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&auto=format&fit=crop'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {order.order_items?.length > 4 && (
                    <span className="text-sm text-gray-500">+{order.order_items.length - 4} more</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
