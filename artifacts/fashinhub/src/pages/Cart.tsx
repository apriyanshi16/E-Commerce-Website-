import { Link } from "wouter";
import { 
  useGetCart, 
  useUpdateCartItem, 
  useRemoveFromCart, 
  getGetCartQueryKey 
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/format";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Cart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useGetCart({
    query: { enabled: !!user, queryKey: getGetCartQueryKey() }
  });

  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    updateItem.mutate(
      { params: { productId }, data: { quantity } },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() })
      }
    );
  };

  const handleRemove = (productId: number) => {
    removeItem.mutate(
      { params: { productId } },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() })
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet. Discover our premium collections and find something you love.
        </p>
        <Button size="lg" asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart ({cart.itemCount} items)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex gap-6 py-6 border-b last:border-0 bg-card rounded-2xl p-4 shadow-sm">
                <Link href={`/products/${item.productId}`} className="w-24 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={item.imageUrl || `https://picsum.photos/seed/${item.productId}/200/300`} 
                    alt={item.productName} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://picsum.photos/seed/${item.productId}/200/300`; }}
                  />
                </Link>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <Link href={`/products/${item.productId}`} className="font-semibold text-lg hover:text-primary transition-colors">
                      {item.productName}
                    </Link>
                    <div className="text-right">
                      <div className="font-bold text-lg">{formatPrice(item.price)}</div>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <div className="text-sm text-muted-foreground line-through">
                          {formatPrice(item.originalPrice)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border rounded-lg bg-background">
                      <button 
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
                        disabled={item.quantity <= 1 || updateItem.isPending}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
                        disabled={updateItem.isPending || (item.stock !== undefined && item.quantity >= item.stock)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove(item.productId)}
                      disabled={removeItem.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card border rounded-2xl p-6 sticky top-24 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="border-t pt-4 mt-4 flex justify-between items-center">
                <span className="text-base font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">{formatPrice(cart.subtotal)}</span>
              </div>
            </div>

            <Button size="lg" className="w-full h-14 text-base shadow-md" asChild>
              <Link href="/checkout">
                Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <div className="mt-6 text-center text-xs text-muted-foreground">
              Secure checkout. Free shipping on all orders.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
