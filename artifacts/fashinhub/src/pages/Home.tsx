import { useGetFeaturedProducts, useGetTrendingProducts, useGetDeals, useGetCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Zap, Flame, Star, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_IMAGES: Record<string, string> = {
  "Men's Fashion":    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop",
  "Women's Fashion":  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop",
  "Footwear":         "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop",
  "Accessories":      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&auto=format&fit=crop",
  "Sportswear":       "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop",
  "Bags & Luggage":   "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop",
  "Kids & Baby":      "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&auto=format&fit=crop",
  "Beauty & Grooming":"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop",
};

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
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://picsum.photos/seed/hero/2070/1380"; }}
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
          <Button variant="ghost" asChild>
            <Link href="/products">All Products <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loadingCategories ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))
          ) : (
            categories?.map((cat) => {
              const img = CATEGORY_IMAGES[cat.name] ?? cat.imageUrl ?? `https://picsum.photos/seed/${cat.id}/600/800`;
              return (
                <Link
                  key={cat.id}
                  href={`/products?categoryId=${cat.id}`}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden block bg-neutral-900 hover-elevate"
                >
                  {/* Background image */}
                  <img
                    src={img}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = `https://picsum.photos/seed/cat${cat.id}/600/800`;
                      e.currentTarget.onerror = null;
                    }}
                  />
                  {/* Gradient overlay — heavy at bottom, fades to transparent */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  {/* Hover tint */}
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                    <div>
                      <p className="text-white/70 text-xs uppercase tracking-widest mb-1 font-medium">Collection</p>
                      <h3 className="text-white font-bold text-xl leading-tight drop-shadow-lg">{cat.name}</h3>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                      <ChevronRight className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </Link>
              );
            })
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
