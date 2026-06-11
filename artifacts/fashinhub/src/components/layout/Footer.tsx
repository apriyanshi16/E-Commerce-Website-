import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-primary">FashinHub</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your premium destination for fashion-forward style. Curated collections for the modern wardrobe.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary">All Products</Link></li>
              <li><Link href="/products?sort=newest" className="hover:text-primary">New Arrivals</Link></li>
              <li><Link href="/products?isDeal=true" className="hover:text-primary">Deals</Link></li>
              <li><Link href="/products?isTrending=true" className="hover:text-primary">Trending</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/orders" className="hover:text-primary">Track Order</Link></li>
              <li><Link href="/returns" className="hover:text-primary">Returns & Exchanges</Link></li>
              <li><Link href="/shipping" className="hover:text-primary">Shipping Info</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/profile" className="hover:text-primary">My Profile</Link></li>
              <li><Link href="/orders" className="hover:text-primary">Order History</Link></li>
              <li><Link href="/wishlist" className="hover:text-primary">Wishlist</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FashinHub. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
