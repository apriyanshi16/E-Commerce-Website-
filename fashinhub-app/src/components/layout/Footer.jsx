import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Notebook as Facebook, Battery as Twitter, Drama as Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">FashionHub</h3>
            <p className="text-gray-400 text-sm">Your one-stop destination for premium fashion and accessories.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/products" className="hover:text-white">Products</Link></li>
              <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/orders" className="hover:text-white">Track Order</Link></li>
              <li><span className="cursor-default">Returns & Exchanges</span></li>
              <li><span className="cursor-default">Shipping Info</span></li>
              <li><span className="cursor-default">FAQ</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@fashionhub.com</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 1-800-FASHION</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> New York, NY</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">&copy; 2024 FashionHub. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-white"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-white"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-white"><Instagram className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
