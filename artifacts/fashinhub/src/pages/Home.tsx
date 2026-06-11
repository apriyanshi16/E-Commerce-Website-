import { useGetFeaturedProducts, useGetTrendingProducts, useGetDeals, useGetCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Zap, Flame, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: featured, isLoading: loadingFeatured } = useGetFeaturedProducts();
  const { data: trending, isLoading: loadingTrending } = useGetTrendingProducts();
  const { data: deals, isLoading: loadingDeals } = useGetDeals();
  const { data: categories, isLoading: loadingCategories } = useGetCategories();

  return (
    <div className="flex flex-col pb-16">
      {/* Hero Banner */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden bg-primary/5">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2070" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        <div className="container relative z-10 px-4 flex flex-col items-start max-w-4xl mx-auto text-center md:text-left md:ml-20">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
            Elevate Your <br/><span className="text-primary">Everyday Style</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
            Discover premium collections curated for the modern wardrobe. Uncompromising quality meets exceptional design.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" asChild className="text-base px-8 h-14">
              <Link href="/products">Shop Collection</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8 h-14 bg-background/50 backdrop-blur">
              <Link href="/products?isTrending=true">View Trending</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loadingCategories ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))
          ) : (
            categories?.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/products?categoryId=${cat.id}`}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-muted flex items-center justify-center p-6 hover-elevate transition-all"
              >
                {cat.imageUrl && (
                  <img src={cat.imageUrl} alt={cat.name} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500" />
                )}
                <span className="relative z-10 font-medium text-lg text-foreground group-hover:text-primary transition-colors">{cat.name}</span>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Deals Strip */}
      <section className="bg-destructive/5 py-16 border-y border-destructive/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-full text-destructive">
                <Zap className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Deals of the Day</h2>
            </div>
            <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" asChild>
              <Link href="/products?isDeal=true">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {loadingDeals ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[400px] rounded-lg" />
              ))
            ) : (
              deals?.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Flame className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Trending Now</h2>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/products?isTrending=true">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {loadingTrending ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[400px] rounded-lg" />
            ))
          ) : (
            trending?.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent rounded-full text-accent-foreground">
              <Star className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Collection</h2>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/products?isFeatured=true">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {loadingFeatured ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[400px] rounded-lg" />
            ))
          ) : (
            featured?.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
