import { Link } from "wouter";
import { useGetOrders, getGetOrdersQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ChevronRight } from "lucide-react";

export default function Orders() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useGetOrders({
    query: { enabled: !!user, queryKey: getGetOrdersQueryKey() }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Order History</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6">When you place an order, it will appear here.</p>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-card border rounded-2xl p-6 hover-elevate transition-all">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 pb-4 border-b">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-lg">Order #{order.id}</span>
                    <Badge variant="outline" className={`capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Placed on {formatDate(order.createdAt)}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="font-bold text-lg">{formatPrice(order.total)}</div>
                  <div className="text-sm text-muted-foreground">{order.items.length} items</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2 overflow-hidden">
                  {order.items.slice(0, 4).map((item, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-gray-100 overflow-hidden relative z-10">
                      <img 
                        src={item.imageUrl || `https://picsum.photos/seed/${item.productId}/100/100`} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium relative z-10">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>
                <Button variant="ghost" asChild className="hover:bg-primary/10 hover:text-primary">
                  <Link href={`/orders/${order.id}`}>
                    View Details <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
