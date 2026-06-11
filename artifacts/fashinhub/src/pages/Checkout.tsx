import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetCart, useCreateOrder, getGetCartQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPrice } from "@/lib/format";
import { CheckCircle2, CreditCard, Wallet, Truck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const checkoutSchema = z.object({
  shippingAddress: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const { data: cart } = useGetCart({
    query: { enabled: !!user, queryKey: getGetCartQueryKey() }
  });

  const createOrder = useCreateOrder();

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: user?.address || "",
      city: user?.city || "",
      country: user?.country || "",
      paymentMethod: "credit_card",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
    },
  });

  const onSubmit = (data: CheckoutForm) => {
    if (step < 3) {
      setStep((s) => (s + 1) as 1 | 2 | 3);
      return;
    }

    createOrder.mutate(
      {
        data: {
          shippingAddress: data.shippingAddress,
          city: data.city,
          country: data.country,
          paymentMethod: data.paymentMethod,
          cardLast4: data.cardNumber?.slice(-4) || "4242",
        },
      },
      {
        onSuccess: (order) => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Order placed successfully!", description: "We'll send you an email confirmation." });
          setLocation(`/orders/${order.id}`);
        },
        onError: () => {
          toast({ title: "Checkout failed", description: "There was an error processing your order.", variant: "destructive" });
        }
      }
    );
  };

  if (!cart || cart.items.length === 0) {
    setLocation("/cart");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Checkout</h1>
        {/* Progress Steps */}
        <div className="flex items-center max-w-2xl mx-auto">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</div>
            <span className={`text-sm ${step >= 1 ? 'font-medium' : 'text-muted-foreground'}`}>Shipping</span>
          </div>
          <div className={`h-1 flex-1 mx-2 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
            <span className={`text-sm ${step >= 2 ? 'font-medium' : 'text-muted-foreground'}`}>Payment</span>
          </div>
          <div className={`h-1 flex-1 mx-2 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          <div className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>3</div>
            <span className={`text-sm ${step >= 3 ? 'font-medium' : 'text-muted-foreground'}`}>Review</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Step 1: Shipping */}
              {step === 1 && (
                <div className="bg-card border rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 mb-6 border-b pb-4">
                    <Truck className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Shipping Address</h2>
                  </div>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="shippingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St, Apt 4B" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="United States" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <Button type="submit" size="lg">Continue to Payment</Button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="bg-card border rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 mb-6 border-b pb-4">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Payment Method</h2>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-xl bg-background/50 hover:bg-muted/50 cursor-pointer transition-colors">
                              <FormControl>
                                <RadioGroupItem value="credit_card" />
                              </FormControl>
                              <FormLabel className="font-normal flex flex-1 justify-between cursor-pointer">
                                <span>Credit Card</span>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-xl bg-background/50 hover:bg-muted/50 cursor-pointer transition-colors">
                              <FormControl>
                                <RadioGroupItem value="paypal" />
                              </FormControl>
                              <FormLabel className="font-normal flex flex-1 justify-between cursor-pointer">
                                <span>PayPal</span>
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("paymentMethod") === "credit_card" && (
                    <div className="mt-6 space-y-4 p-4 border rounded-xl bg-muted/20">
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Card Number</FormLabel>
                            <FormControl>
                              <Input placeholder="0000 0000 0000 0000" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="cardExpiry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiry Date</FormLabel>
                              <FormControl>
                                <Input placeholder="MM/YY" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cardCvc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CVC</FormLabel>
                              <FormControl>
                                <Input placeholder="123" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button type="submit" size="lg">Review Order</Button>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="bg-card border rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 mb-6 border-b pb-4">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Review Your Order</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-xl">
                      <div>
                        <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wider">Shipping To</h3>
                        <p className="font-medium">{form.getValues("shippingAddress")}</p>
                        <p>{form.getValues("city")}, {form.getValues("country")}</p>
                        <Button type="button" variant="link" className="p-0 h-auto mt-2 text-primary" onClick={() => setStep(1)}>Edit</Button>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wider">Payment Method</h3>
                        <p className="font-medium capitalize">{form.getValues("paymentMethod").replace('_', ' ')}</p>
                        {form.getValues("paymentMethod") === "credit_card" && (
                          <p>Ending in {form.getValues("cardNumber")?.slice(-4) || "****"}</p>
                        )}
                        <Button type="button" variant="link" className="p-0 h-auto mt-2 text-primary" onClick={() => setStep(2)}>Edit</Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4">Items ({cart.itemCount})</h3>
                      <div className="space-y-3">
                        {cart.items.map((item) => (
                          <div key={item.productId} className="flex justify-between text-sm py-2 border-b last:border-0">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{item.quantity}x</span>
                              <span>{item.productName}</span>
                            </div>
                            <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <Button type="submit" size="lg" disabled={createOrder.isPending}>
                      {createOrder.isPending ? "Processing..." : "Place Order"}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-2xl p-6 sticky top-24 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items ({cart.itemCount})</span>
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
            {step === 3 && (
              <Button className="w-full" size="lg" onClick={form.handleSubmit(onSubmit)} disabled={createOrder.isPending}>
                Place Order
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
