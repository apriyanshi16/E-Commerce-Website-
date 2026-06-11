import { useParams, Link } from "wouter";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Package, Truck, CheckCircle2, Clock } from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams();
  const orderId = Number(id);
  const { user } = useAuth();
  
  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!user && !!orderId, queryKey: getGetOrderQueryKey(orderId) }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'shipped': return <Truck className="w-6 h-6 text-purple-600" />;
      case 'processing': return <Package className="w-6 h-6 text-blue-600" />;
      default: return <Clock className="w-6 h-6 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-40 mb-8" />
        <Skeleton className="h-40 rounded-2xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2"><Skeleton className="h-96 rounded-2xl" /></div>
          <div><Skeleton className="h-64 rounded-2xl" /></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="container mx-auto px-4 py-20 text-center">Order not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent" asChild>
        <Link href="/orders"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders</Link>
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Order #{order.id}
            <Badge variant="outline" className={`capitalize text-sm ${getStatusColor(order.status)}`}>
              {order.status}
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Status Timeline */}
          <div className="bg-card border rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6">Order Status</h2>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border">
              <div className="bg-background p-3 rounded-full shadow-sm">
                {getStatusIcon(order.status)}
              </div>
              <div>
                <h3 className="font-semibold capitalize text-lg">{order.status}</h3>
                {order.trackingNumber && (
                  <p className="text-sm text-muted-foreground mt-1">Tracking: <span className="font-medium text-foreground">{order.trackingNumber}</span></p>
                )}
                {order.estimatedDelivery && order.status !== 'delivered' && (
                  <p className="text-sm text-muted-foreground mt-1">Estimated delivery: <span className="font-medium text-foreground">{formatDate(order.estimatedDelivery)}</span></p>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-card border rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6">Items ({order.items.length})</h2>
            <div className="space-y-6">
              {order.items.map((item) => (
                <div key={item.productId} className="flex gap-4 pb-6 border-b last:border-0 last:pb-0">
                  <Link href={`/products/${item.productId}`} className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
                    <img 
                      src={item.imageUrl || `https://picsum.photos/seed/${item.productId}/200/200`} 
                      alt={item.productName} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://picsum.photos/seed/${item.productId}/200/200`; }}
                    />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${item.productId}`} className="font-semibold hover:text-primary transition-colors">
                        {item.productName}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-medium">{formatPrice(item.price)}</div>
                  </div>
                  <div className="font-bold text-right">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          {/* Order Summary */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Summary</h2>
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{order.shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(order.shipping)}</span>
              </div>
              <div className="border-t pt-3 mt-3 flex justify-between items-center">
                <span className="text-base font-bold">Total</span>
                <span className="text-xl font-bold text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Shipping Info</h2>
            <address className="not-italic text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">{user?.name}</p>
              <p>{order.shippingAddress}</p>
              <p>{order.paymentMethod ? <span className="capitalize block mt-4"><span className="text-foreground font-medium">Payment:</span> {order.paymentMethod.replace('_', ' ')}</span> : null}</p>
            </address>
          </div>
        </div>
      </div>
    </div>
  );
}
