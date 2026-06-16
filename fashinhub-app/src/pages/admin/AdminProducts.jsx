import { useState, useEffect } from 'react';
import { Plus, Search, CreditCard as Edit, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/utils';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', compare_at_price: '', quantity: '', category_id: '', images: [''] });

  useEffect(() => { fetchProducts(); fetchCategories(); }, [search]);

  const fetchCategories = async () => { const { data } = await supabase.from('categories').select('*'); setCategories(data || []); };
  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from('products').select('*, category:categories(*)');
    if (search) query = query.ilike('name', `%${search}%`);
    const { data } = await query.order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const productData = { name: formData.name, description: formData.description, price: parseFloat(formData.price), compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null, quantity: parseInt(formData.quantity), category_id: formData.category_id || null, images: formData.images.filter(Boolean) };
    if (editingProduct) await supabase.from('products').update(productData).eq('id', editingProduct.id);
    else await supabase.from('products').insert(productData);
    setShowModal(false); setEditingProduct(null); resetForm(); fetchProducts();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({ name: product.name || '', description: product.description || '', price: product.price?.toString() || '', compare_at_price: product.compare_at_price?.toString() || '', quantity: product.quantity?.toString() || '', category_id: product.category_id || '', images: product.images?.length > 0 ? product.images : [''] });
    setShowModal(true);
  };

  const handleDelete = async (id) => { if (!confirm('Delete this product?')) return; await supabase.from('products').delete().eq('id', id); fetchProducts(); };
  const resetForm = () => setFormData({ name: '', description: '', price: '', compare_at_price: '', quantity: '', category_id: '', images: [''] });
  const handleImageChange = (i, value) => { const newImages = [...formData.images]; newImages[i] = value; setFormData({ ...formData, images: newImages }); };
  const addImageField = () => setFormData({ ...formData, images: [...formData.images, ''] });
  const removeImageField = (i) => { const newImages = formData.images.filter((_, idx) => idx !== i); setFormData({ ...formData, images: newImages.length > 0 ? newImages : [''] }); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Products</h1><p className="text-gray-500">Manage your product catalog</p></div>
        <button onClick={() => { resetForm(); setEditingProduct(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"><Plus className="w-4 h-4" />Add Product</button>
      </div>
      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? <div className="p-6 text-center text-gray-500">Loading...</div> : products.length === 0 ? <div className="p-6 text-center text-gray-500">No products found</div> : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr><th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Product</th><th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Category</th><th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Price</th><th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Stock</th><th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th></tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={product.images?.[0] || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&auto=format&fit=crop'} alt={product.name} className="w-10 h-10 object-cover rounded" /><div><p className="font-medium">{product.name}</p><p className="text-sm text-gray-500 line-clamp-1">{product.description}</p></div></div></td>
                  <td className="px-6 py-4 text-gray-500">{product.category?.name || '-'}</td>
                  <td className="px-6 py-4">{formatPrice(product.price)}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${product.quantity > 10 ? 'bg-green-100 text-green-700' : product.quantity > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}</span></td>
                  <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => handleEdit(product)} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded"><Edit className="w-4 h-4" /></button><button onClick={() => handleDelete(product.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-xl font-semibold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2><button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-2">Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div>
              <div><label className="block text-sm font-medium mb-2">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-2">Price</label><input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div>
                <div><label className="block text-sm font-medium mb-2">Compare at Price</label><input type="number" step="0.01" value={formData.compare_at_price} onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-2">Quantity</label><input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div>
                <div><label className="block text-sm font-medium mb-2">Category</label><select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"><option value="">Select category</option>{categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}</select></div>
              </div>
              <div><label className="block text-sm font-medium mb-2">Images</label>{formData.images.map((img, i) => (<div key={i} className="flex gap-2 mb-2"><input type="url" value={img} onChange={(e) => handleImageChange(i, e.target.value)} placeholder="Image URL" className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />{formData.images.length > 1 && <button type="button" onClick={() => removeImageField(i)} className="p-2 text-red-500 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>}</div>))}<button type="button" onClick={addImageField} className="text-sm text-primary-600 hover:underline">+ Add image</button></div>
              <div className="flex gap-4 pt-4"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" disabled={loading} className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">{loading ? 'Saving...' : editingProduct ? 'Update' : 'Create'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
