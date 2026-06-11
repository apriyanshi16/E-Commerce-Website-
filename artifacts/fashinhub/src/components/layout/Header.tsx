import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, Heart, User as UserIcon, Menu, LogOut, Package, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useGetCart, useGetWishlist, useGetCategories, getGetCartQueryKey, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cart } = useGetCart({ query: { enabled: !!user, queryKey: getGetCartQueryKey() } });
  const { data: wishlist } = useGetWishlist({ query: { enabled: !!user, queryKey: getGetWishlistQueryKey() } });
  const { data: categories } = useGetCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <Package className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-primary tracking-tight hidden sm:inline-block">
            FashinHub
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative hidden md:flex">
          <Input
            type="search"
            placeholder="Search for products, brands and more..."
            className="w-full pl-4 pr-10 rounded-full border-gray-300 focus-visible:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-full rounded-r-full hover:bg-transparent text-muted-foreground hover:text-foreground">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          <Link href="/wishlist">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              {wishlist && wishlist.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {wishlist.length}
                </Badge>
              )}
            </Button>
          </Link>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cart && cart.itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {cart.itemCount}
                </Badge>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer flex items-center">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="cursor-pointer flex items-center">
                    <Package className="mr-2 h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2 ml-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Category Nav */}
      <div className="border-t bg-card hidden md:block">
        <div className="container mx-auto px-4 h-12 flex items-center gap-6 overflow-x-auto no-scrollbar">
          <Link href="/products" className="text-sm font-medium hover:text-primary whitespace-nowrap">
            All Products
          </Link>
          {categories?.map((cat) => (
            <Link key={cat.id} href={`/products?categoryId=${cat.id}`} className="text-sm text-muted-foreground hover:text-primary whitespace-nowrap">
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
