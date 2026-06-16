import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Truck, MapPin, ChevronRight, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../lib/utils';
import { supabase } from '../lib/supabase';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shipping: { firstName: '', lastName: '', email: user?.email || '', phone: '', address: '', city: '', state: '', zipCode: '', country: 'US' },
    payment: { cardNumber: '', cardName: '', expiry: '', cvv: '' },
  });

  if (!user) return <div className="container py-16 text-center"><h2 className="text-xl font-semibold mb-4">Please login to checkout</h2><Link to="/login" className="text-primary-600 hover:underline">Sign In</Link></div>;
  if (cartItems.length === 0) return <div className="container py-16 text-center"><h2 className="text-xl font-semibold mb-4">Your cart is empty</h2><Link to="/products" className="text-primary-600 hover:underline">Browse Products</Link></div>;

  const shippingCost = cartTotal >= 100 ? 0 : 10;
  const total = cartTotal + shippingCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const { data: order, error: orderError } = await supabase.from('orders').insert({ user_id: user.id, order_number: orderNumber, status: 'pending', total: total, shipping_address: formData.shipping, billing_address: formData.shipping }).select().single();
      if (orderError) throw orderError;
      const orderItems = cartItems.map((item) => ({ order_id: order.id, product_id: item.product_id, quantity: item.quantity, price: item.product?.price || 0 }));
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;
      await clearCart();
      navigate(`/orders/${order.id}`);
    } catch (error) { console.error('Checkout error:', error); alert('Failed to place order. Please try again.'); setLoading(false); }
  };

  const steps = [{ id: 1, title: 'Shipping', icon: Truck }, { id: 2, title: 'Payment', icon: CreditCard }, { id: 3, title: 'Review', icon: Check }];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, index) => (<div key={s.id} className="flex items-center"><div className={`flex items-center gap-2 ${step >= s.id ? 'text-primary-600' : 'text-gray-400'}`}><div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= s.id ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}><s.icon className="w-5 h-5" /></div><span className="font-medium hidden md:block">{s.title}</span></div>{index < steps.length - 1 && <div className={`w-16 md:w-24 h-1 mx-2 rounded ${step > s.id ? 'bg-primary-600' : 'bg-gray-200'}`} />}</div>))}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="bg-white rounded-xl border p-6">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2"><Truck className="w-5 h-5 text-primary-600" />Shipping Address</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-2">First Name</label><input type="text" name="firstName" value={formData.shipping.firstName} onChange={(e) => setFormData({ ...formData, shipping: { ...formData.shipping, [e.target.name]: e.target.value } })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div>
                    <div><label className="block text-sm font-medium mb-2">Last Name</label><input type="text" name="lastName" value={formData.shipping.lastName} onChange={(e) => setFormData({ ...formData, shipping: { ...formData.shipping, [e.target.name]: e.target.value } })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div>
                    <div><label className="block text-sm font-medium mb-2">Email</label><input type="email" name="email" value={formData.shipping.email} onChange={(e) => setFormData({ ...formData, shipping: { ...formData.shipping, [e.target.name]: e.target.value } })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div>
                    <div><label className="block text-sm font-medium mb-2">Phone</label><input type="tel" name="phone" value={formData.shipping.phone} onChange={(e) => setFormData({ ...formData, shipping: { ...formData.shipping, [e.target.name]: e.target.value } })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium mb-2">Street Address</label><input type="text" name="address" value={formData.shipping.address} onChange={(e) => setFormData({ ...formData, shipping: { ...formData.shipping, [e.target.name]: e.target.value } })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div>
                    <div><label className="block text-sm font-medium mb-2">City</label><input type="text" name="city" value={formData.shipping.city} onChange={(e) => setFormData({ ...formData, shipping: { ...formData.shipping, [e.target.name]: e.target.value } })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div>
                    <div><label className="block text-sm font-medium mb-2">State</label><input type="text" name="state" value={formData.shipping.state} onChange={(e) => setFormData({ ...formData, shipping: { ...formData.shipping, [e.target.name]: e.target.value } })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div>
                    <div><label className="block text-sm font-medium mb-2">ZIP Code</label><input type="text" name="zipCode" value={formData.shipping.zipCode} onChange={(e) => setFormData({ ...formData, shipping: { ...formData.shipping, [e.target.name]: e.target.value } })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div>
                  </div>
                  <button type="button" onClick={() => setStep(2)} className="mt-6 w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2">Continue to Payment <ChevronRight className="w-4 h-4" /></button>
                </div>
              )}
              {step === 2 && (
                <div className="bg-white rounded-xl border p-6">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary-600" />Payment Details</h2>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium mb-2">Card Number</label><input type="text" name="cardNumber" value={formData.payment.cardNumber} onChange={(e) => setFormData({ ...formData, payment: { ...formData.payment, [e.target.name]: e.target.value } })} placeholder="1234 5678 9012 3456" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div>
                    <div><label className="block text-sm font-medium mb-2">Name on Card</label><input type="text" name="cardName" value={formData.payment.cardName} onChange={(e) => setFormData({ ...formData, payment: { ...formData.payment, [e.target.name]: e.target.value } })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium mb-2">Expiry Date</label><input type="text" name="expiry" value={formData.payment.expiry} onChange={(e) => setFormData({ ...formData, payment: { ...formData.payment, [e.target.name]: e.target.value } })} placeholder="MM/YY" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div>
                      <div><label className="block text-sm font-medium mb-2">CVV</label><input type="text" name="cvv" value={formData.payment.cvv} onChange={(e) => setFormData({ ...formData, payment: { ...formData.payment, [e.target.name]: e.target.value } })} placeholder="123" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6"><button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Back</button><button type="button" onClick={() => setStep(3)} className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700">Review Order</button></div>
                </div>
              )}
              {step === 3 && (
                <div className="bg-white rounded-xl border p-6">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2"><Check className="w-5 h-5 text-primary-600" />Review Your Order</h2>
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4"><div className="flex items-start gap-3 mb-2"><MapPin className="w-5 h-5 text-gray-400 mt-0.5" /><div><p className="font-medium">Shipping Address</p><p className="text-gray-600">{formData.shipping.firstName} {formData.shipping.lastName}<br />{formData.shipping.address}<br />{formData.shipping.city}, {formData.shipping.state} {formData.shipping.zipCode}</p></div></div></div>
                    <div className="border rounded-lg p-4"><div className="flex items-start gap-3"><CreditCard className="w-5 h-5 text-gray-400 mt-0.5" /><div><p className="font-medium">Payment Method</p><p className="text-gray-600">Card ending in {formData.payment.cardNumber.slice(-4) || '****'}</p></div></div></div>
                    <div className="border rounded-lg divide-y">{cartItems.map((item) => (<div key={item.id} className="flex gap-4 p-4"><img src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&auto=format&fit=crop'} alt={item.product?.name} className="w-16 h-16 object-cover rounded" /><div className="flex-1"><p className="font-medium">{item.product?.name}</p><p className="text-sm text-gray-500">Qty: {item.quantity}</p></div><p className="font-medium">{formatPrice((item.product?.price || 0) * item.quantity)}</p></div>))}</div>
                  </div>
                  <div className="flex gap-4 mt-6"><button type="button" onClick={() => setStep(2)} className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Back</button><button type="submit" disabled={loading} className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50">{loading ? 'Processing...' : 'Place Order'}</button></div>
                </div>
              )}
            </form>
          </div>
          <div>
            <div className="bg-white rounded-xl border p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">{cartItems.map((item) => (<div key={item.id} className="flex justify-between text-sm"><span className="text-gray-600">{item.product?.name} x {item.quantity}</span><span>{formatPrice((item.product?.price || 0) * item.quantity)}</span></div>))}</div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span></div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t"><span>Total</span><span className="text-primary-600">{formatPrice(total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
