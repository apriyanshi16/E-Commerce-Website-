import { useState } from "react";
import { useLocation } from "wouter";
import { useGetProducts, useGetCategories, getGetProductsQueryKey } from "@workspace/api-client-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, X } from "lucide-react";

export default function Products() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [categoryId, setCategoryId] = useState<number | null>(
    searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : null
  );
  const [minPrice, setMinPrice] = useState<string>(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState<any>(searchParams.get("sort") || "newest");
  const [isDeal, setIsDeal] = useState(searchParams.get("isDeal") === "true");
  const [isTrending, setIsTrending] = useState(searchParams.get("isTrending") === "true");
  const [isFeatured, setIsFeatured] = useState(searchParams.get("isFeatured") === "true");

  const { data: categories } = useGetCategories();
  
  const currentParams = {
    ...(q && { q }),
    ...(categoryId && { categoryId }),
    ...(minPrice && { minPrice: Number(minPrice) }),
    ...(maxPrice && { maxPrice: Number(maxPrice) }),
    ...(sort && { sort }),
    limit: 24,
  };

  // We have to filter isDeal / isTrending manually if the backend doesn't support them via params
  // The API spec params: { q, categoryId, minPrice, maxPrice, rating, sort, page, limit }
  const { data, isLoading } = useGetProducts(currentParams, { 
    query: { queryKey: getGetProductsQueryKey(currentParams) } 
  });

  let displayProducts = data?.products || [];
  if (isDeal) displayProducts = displayProducts.filter(p => p.isDeal);
  if (isTrending) displayProducts = displayProducts.filter(p => p.isTrending);
  if (isFeatured) displayProducts = displayProducts.filter(p => p.isFeatured);

  const clearFilters = () => {
    setQ("");
    setCategoryId(null);
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setIsDeal(false);
    setIsTrending(false);
    setIsFeatured(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="flex items-center justify-between lg:hidden mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Filter className="h-5 w-5" /> Filters
            </h2>
            <Button variant="outline" size="sm" onClick={clearFilters}>Clear All</Button>
          </div>

          <div className="bg-card border rounded-xl p-5 space-y-6">
            <div className="hidden lg:flex items-center justify-between">
              <h2 className="text-lg font-bold">Filters</h2>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>

            <div className="space-y-3">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search products..." 
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Category</Label>
              <Select value={categoryId?.toString() || "all"} onValueChange={(val) => setCategoryId(val === "all" ? null : Number(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Price Range</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span>-</span>
                <Input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Sort By</Label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {q ? `Search results for "${q}"` : 
               categoryId ? categories?.find(c => c.id === categoryId)?.name || 'Products' :
               isDeal ? "Deals of the Day" :
               isTrending ? "Trending Products" :
               isFeatured ? "Featured Products" :
               "All Products"}
            </h1>
            <p className="text-muted-foreground text-sm">
              Showing {displayProducts.length} results
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[400px] rounded-lg" />
              ))}
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-dashed">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No products found</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                We couldn't find any products matching your current filters. Try adjusting your search or clearing filters.
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
