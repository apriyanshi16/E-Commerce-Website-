import { useState, useEffect } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice, formatDate } from '../../lib/utils';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { fetchOrders(); }, [search, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase.from('orders').select('*, order_items(*, product:products(*))').order('created_at', { ascending: false });
    if (search) query = query.ilike('order_number', `%${search}%`);
    if (statusFilter) query = query.eq('status', statusFilter);
    const { data } = await query;
    setOrders(data || []);
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    fetchOrders();
    if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
  };

  const getStatusColor = (status) => {
    const colors = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Orders</h1><p className="text-gray-500">Manage customer orders</p></div>
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order number..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"><option value="">All Statuses</option>{statuses.map((status) => (<option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>))}</select>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? <div className="p-6 text-center text-gray-500">Loading...</div> : orders.length === 0 ? <div className="p-6 text-center text-gray-500">No orders found</div> : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr><th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Order</th><th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th><th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th><th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Total</th><th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th></tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><p className="font-medium">{order.order_number}</p><p className="text-sm text-gray-500">{order.order_items?.length || 0} items</p></td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(order.created_at)}</td>
                  <td className="px-6 py-4"><select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className={`appearance-none px-3 py-1 rounded-full text-sm font-medium capitalize cursor-pointer ${getStatusColor(order.status)}`}>{statuses.map((status) => (<option key={status} value={status}>{status}</option>))}</select></td>
                  <td className="px-6 py-4 font-semibold">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4 text-right"><button onClick={() => setSelectedOrder(order)} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded"><Eye className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-xl font-semibold">Order Details</h2><button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between"><div><p className="text-gray-500 text-sm">Order Number</p><p className="font-semibold">{selectedOrder.order_number}</p></div><span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span></div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4"><p className="text-gray-500 text-sm mb-2">Shipping Address</p><p>{selectedOrder.shipping_address?.firstName} {selectedOrder.shipping_address?.lastName}<br />{selectedOrder.shipping_address?.address}<br />{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.zipCode}</p></div>
                <div className="bg-gray-50 rounded-lg p-4"><p className="text-gray-500 text-sm mb-2">Order Date</p><p>{formatDate(selectedOrder.created_at)}</p></div>
              </div>
              <div><h3 className="font-semibold mb-4">Items</h3><div className="space-y-3">{selectedOrder.order_items?.map((item) => (<div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg"><img src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&auto=format&fit=crop'} alt={item.product?.name} className="w-16 h-16 object-cover rounded" /><div className="flex-1"><p className="font-medium">{item.product?.name}</p><p className="text-sm text-gray-500">Qty: {item.quantity}</p></div><p className="font-semibold">{formatPrice(item.price * item.quantity)}</p></div>))}</div></div>
              <div className="border-t pt-4 flex justify-between font-semibold text-lg"><span>Total</span><span className="text-primary-600">{formatPrice(selectedOrder.total)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
