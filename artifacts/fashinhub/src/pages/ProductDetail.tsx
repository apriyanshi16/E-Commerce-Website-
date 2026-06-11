import { useState } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetProduct, 
  useGetProductReviews, 
  useCreateReview, 
  useAddToCart,
  useAddToWishlist,
  getGetProductQueryKey,
  getGetProductReviewsQueryKey
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/format";
import { StarRating } from "@/components/shared/StarRating";
import { ShoppingCart, Heart, Minus, Plus, Share2, Check, Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

export default function ProductDetail() {
  const { id } = useParams();
  const productId = Number(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");

  const { data: product, isLoading: loadingProduct } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) }
  });
  
  const { data: reviews, isLoading: loadingReviews } = useGetProductReviews(productId, {
    query: { enabled: !!productId, queryKey: getGetProductReviewsQueryKey(productId) }
  });

  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const createReview = useCreateReview();

  const handleAddToCart = () => {
    if (!user) {
      toast({ title: "Please login to add to cart", variant: "destructive" });
      return;
    }
    addToCart.mutate(
      { data: { productId, quantity } },
      {
        onSuccess: () => {
          toast({ title: "Added to cart", description: `${quantity} x ${product?.name} added to your cart.` });
        }
      }
    );
  };

  const handleAddToWishlist = () => {
    if (!user) {
      toast({ title: "Please login to add to wishlist", variant: "destructive" });
      return;
    }
    addToWishlist.mutate(
      { productId },
      {
        onSuccess: () => {
          toast({ title: "Added to wishlist" });
        }
      }
    );
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please login to leave a review", variant: "destructive" });
      return;
    }
    createReview.mutate(
      { params: { id: productId }, data: { rating: reviewRating, title: reviewTitle, body: reviewBody } },
      {
        onSuccess: () => {
          toast({ title: "Review submitted", description: "Thank you for your feedback!" });
          setReviewTitle("");
          setReviewBody("");
          setReviewRating(5);
          queryClient.invalidateQueries({ queryKey: getGetProductReviewsQueryKey(productId) });
        }
      }
    );
  };

  if (loadingProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-20 text-center">Product not found</div>;
  }

  const allImages = product.images?.length ? product.images : [product.imageUrl || `https://picsum.photos/seed/${product.id}/800/800`];
  const mainImage = selectedImage || allImages[0];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/products?categoryId=${product.categoryId}`} className="hover:text-primary">
          {product.categoryName}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[4/5] md:aspect-square bg-gray-100 rounded-2xl overflow-hidden border">
            <img 
              src={mainImage} 
              alt={product.name} 
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://picsum.photos/seed/${product.id}/600/600`; }}
            />
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {allImages.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    mainImage === img ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://picsum.photos/seed/${product.id}/200/200`; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-sm font-medium text-primary mb-2 block">{product.brand}</span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">{product.name}</h1>
            <div className="flex items-center gap-4">
              <StarRating rating={product.rating} count={product.reviewCount} />
              <span className="text-sm text-muted-foreground">|</span>
              <span className="text-sm text-muted-foreground">{product.stock > 0 ? <span className="text-green-600 flex items-center"><Check className="w-4 h-4 mr-1"/> In Stock</span> : <span className="text-red-600">Out of Stock</span>}</span>
            </div>
          </div>

          <div className="my-6">
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-muted-foreground line-through mb-1">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {product.discount && (
              <Badge variant="destructive" className="mt-2 text-sm px-3 py-1">Save {product.discount}%</Badge>
            )}
          </div>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {product.description || "No description available for this product."}
          </p>

          <div className="space-y-6 mt-auto">
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <Label className="text-base font-semibold">Quantity</Label>
                <div className="flex items-center border rounded-lg overflow-hidden bg-card">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="flex-1 h-14 text-lg" 
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addToCart.isPending}
              >
                <ShoppingCart className="mr-2 w-5 h-5" />
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </Button>
              <div className="flex gap-4">
                <Button size="icon" variant="outline" className="h-14 w-14 rounded-xl" onClick={handleAddToWishlist}>
                  <Heart className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="outline" className="h-14 w-14 rounded-xl">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t pt-16">
        <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Review Summary */}
          <div className="md:col-span-1">
            <div className="bg-card border rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-foreground mb-2">{product.rating.toFixed(1)}</div>
                <div className="flex justify-center mb-2">
                  <StarRating rating={product.rating} size={20} />
                </div>
                <p className="text-muted-foreground text-sm">Based on {product.reviewCount} reviews</p>
              </div>
              
              {user ? (
                <form onSubmit={submitReview} className="mt-8 space-y-4">
                  <h3 className="font-semibold text-lg border-t pt-6 mb-4">Write a Review</h3>
                  <div>
                    <Label className="mb-2 block">Rating</Label>
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          type="button"
                          onClick={() => setReviewRating(star)}
                        >
                          <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input 
                      value={reviewTitle} 
                      onChange={e => setReviewTitle(e.target.value)} 
                      placeholder="Summarize your experience" 
                    />
                  </div>
                  <div>
                    <Label>Review</Label>
                    <Textarea 
                      value={reviewBody} 
                      onChange={e => setReviewBody(e.target.value)} 
                      placeholder="What did you like or dislike?"
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createReview.isPending}>
                    {createReview.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              ) : (
                <div className="mt-8 border-t pt-6 text-center">
                  <p className="mb-4 text-sm text-muted-foreground">Sign in to write a review</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Review List */}
          <div className="md:col-span-2 space-y-6">
            {loadingReviews ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))
            ) : reviews?.length ? (
              reviews.map((review) => (
                <div key={review.id} className="bg-card border rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{review.userName}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">Verified Buyer</Badge>
                        )}
                      </div>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    <span className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</span>
                  </div>
                  {review.title && <h4 className="font-bold text-foreground mb-2">{review.title}</h4>}
                  {review.body && <p className="text-muted-foreground">{review.body}</p>}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
