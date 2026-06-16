import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => { await signOut(); navigate('/login'); };

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/users', icon: Users, label: 'Users' },
  ];

  const isActive = (path) => path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="text-xl font-bold text-gray-900">Admin Panel</Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">{sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
      </div>
      <div className="flex">
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-800"><Link to="/admin" className="text-xl font-bold text-white">Admin Panel</Link></div>
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => (<Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path) ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}><item.icon className="w-5 h-5" />{item.label}</Link>))}
            </nav>
            <div className="p-4 border-t border-gray-800">
              <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg mb-2"><LogOut className="w-5 h-5 rotate-180" />Back to Store</Link>
              {user && <div className="px-4 py-3"><p className="text-white font-medium">{user.email}</p><button onClick={handleSignOut} className="text-gray-400 hover:text-white text-sm">Sign Out</button></div>}
            </div>
          </div>
        </aside>
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden" />}
        <main className="flex-1 p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminLayout;
