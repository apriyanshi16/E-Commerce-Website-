import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/format";
import { StarRating } from "./StarRating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
import { useAddToCart, useAddToWishlist, useGetWishlist, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({ title: "Please login to add to cart", variant: "destructive" });
      return;
    }
    addToCart.mutate(
      { data: { productId: product.id, quantity: 1 } },
      {
        onSuccess: () => {
          toast({ title: "Added to cart" });
        },
      }
    );
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({ title: "Please login to add to wishlist", variant: "destructive" });
      return;
    }
    addToWishlist.mutate(
      { params: { productId: product.id } },
      {
        onSuccess: () => {
          toast({ title: "Added to wishlist" });
          queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
        },
      }
    );
  };

  return (
    <Link href={`/products/${product.id}`} className="group relative block rounded-lg border bg-card hover-elevate transition-all duration-300">
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-lg bg-muted">
        <img
          src={product.imageUrl || `https://picsum.photos/seed/${product.id}/400/500`}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null;
            target.src = `https://picsum.photos/seed/${product.id + 100}/400/500`;
          }}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {product.isDeal && <Badge variant="destructive">Sale</Badge>}
          {product.isTrending && <Badge className="bg-primary text-primary-foreground">Trending</Badge>}
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-white/80 hover:bg-white text-gray-700"
          onClick={handleAddToWishlist}
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div>
          <h3 className="font-medium text-lg leading-tight line-clamp-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.brand || product.categoryName}</p>
        </div>
        <StarRating rating={product.rating} count={product.reviewCount} />
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
        <Button
          onClick={handleAddToCart}
          className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 absolute bottom-4 left-0 right-0 w-[calc(100%-2rem)] mx-auto shadow-lg"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </Link>
  );
}
