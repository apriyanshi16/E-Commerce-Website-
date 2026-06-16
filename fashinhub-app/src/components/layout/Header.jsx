import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCategories } from '../../hooks/useData';

const Header = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const { categories } = useCategories();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary-600">FashionHub</Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-sm font-medium ${location.pathname === '/' ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}>Home</Link>
            <Link to="/products" className={`text-sm font-medium ${location.pathname.startsWith('/products') ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}>Products</Link>
            {categories?.slice(0, 4).map(cat => (
              <Link key={cat.id} to={`/products?category=${cat.id}`} className="text-sm font-medium text-gray-600 hover:text-gray-900">{cat.name}</Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-gray-900">
              <Heart className="w-5 h-5" />
              {wishlistItems?.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{wishlistItems.length}</span>}
            </Link>
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-gray-900">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">{cartCount}</span>}
            </Link>

            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-1 p-2 text-gray-600 hover:text-gray-900">
                  <User className="w-5 h-5" />
                  <ChevronDown className="w-4 h-4" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2">
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-50">My Orders</Link>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-50">Profile</Link>
                    <button onClick={() => { signOut(); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex items-center gap-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
                <User className="w-4 h-4" /> Sign In
              </Link>
            )}

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50">Home</Link>
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50">Products</Link>
              {categories?.map(cat => (
                <Link key={cat.id} to={`/products?category=${cat.id}`} onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50">{cat.name}</Link>
              ))}
              {!user && <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-primary-600 font-medium">Sign In</Link>}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
