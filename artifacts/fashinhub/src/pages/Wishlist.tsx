import { Link } from "wouter";
import { useGetWishlist, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { ProductCard } from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";

export default function Wishlist() {
  const { user } = useAuth();
  
  const { data: wishlist, isLoading } = useGetWishlist({
    query: { enabled: !!user, queryKey: getGetWishlistQueryKey() }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-8 w-8 text-primary fill-primary/20" />
        <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[400px] rounded-xl" />
          ))}
        </div>
      ) : !wishlist || wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-dashed shadow-sm max-w-3xl mx-auto">
          <div className="p-4 bg-muted rounded-full mb-6">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Save items you love to your wishlist to keep track of them and easily add them to your cart later.
          </p>
          <Button size="lg" asChild>
            <Link href="/products">Explore Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
