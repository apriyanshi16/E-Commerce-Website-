import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CircleCheck as CheckCircle, MapPin, CreditCard } from 'lucide-react';
import { useOrders } from '../hooks/useData';
import { formatPrice, formatDate } from '../lib/utils';

const OrderDetail = () => {
  const { id } = useParams();
  const { orders, loading } = useOrders();
  const order = orders.find((o) => o.id === id);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-xl font-semibold mb-4">Order not found</h2>
        <Link to="/orders" className="text-primary-600 hover:underline">Back to Orders</Link>
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

  const steps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStep = steps.indexOf(order.status) + 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <Link to="/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Order #{order.order_number}</h1>
                  <p className="text-gray-500">Placed on {formatDate(order.created_at)}</p>
                </div>
                <span className={`px-4 py-2 rounded-full font-medium capitalize ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="flex justify-between mb-8">
                {['Order Placed', 'Processing', 'Shipped', 'Delivered'].map((step, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep > i ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                      {currentStep > i ? <CheckCircle className="w-5 h-5" /> : i + 1}
                    </div>
                    <p className={`mt-2 text-xs ${currentStep > i ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border divide-y">
              <div className="p-6">
                <h2 className="font-semibold">Items ({order.order_items?.length || 0})</h2>
              </div>
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex gap-4 p-6">
                  <img
                    src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&auto=format&fit=crop'}
                    alt={item.product?.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <Link to={`/products/${item.product_id}`} className="font-medium hover:underline">
                      {item.product?.name || 'Product'}
                    </Link>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                Shipping Address
              </h3>
              <p className="text-gray-600">
                {order.shipping_address?.firstName} {order.shipping_address?.lastName}<br />
                {order.shipping_address?.address}<br />
                {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zipCode}
              </p>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-400" />
                Payment
              </h3>
              <p className="text-gray-600">Credit Card</p>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold mb-4">Order Total</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
