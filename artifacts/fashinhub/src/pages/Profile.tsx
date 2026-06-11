import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetUserProfile, useUpdateUserProfile, useGetOrderSummary, getGetUserProfileQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCircle, Package, MapPin, Phone, Mail, Award } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: loadingProfile } = useGetUserProfile({
    query: { enabled: !!user, queryKey: getGetUserProfileQueryKey() }
  });

  const { data: summary, isLoading: loadingSummary } = useGetOrderSummary({
    query: { enabled: !!user }
  });

  const updateProfile = useUpdateUserProfile();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      city: "",
      country: "",
    },
  });

  // Reset form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        country: profile.country || "",
      });
    }
  }, [profile, form]);

  const onSubmit = (data: ProfileForm) => {
    updateProfile.mutate(
      { data },
      {
        onSuccess: (updatedUser) => {
          // Update local auth context
          if (user) {
            login(updatedUser, localStorage.getItem("fashinhub_token") || "");
          }
          queryClient.invalidateQueries({ queryKey: getGetUserProfileQueryKey() });
          toast({ title: "Profile updated successfully" });
        },
        onError: () => {
          toast({ title: "Failed to update profile", variant: "destructive" });
        }
      }
    );
  };

  if (loadingProfile || !profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6"><Skeleton className="h-64 rounded-2xl" /></div>
          <div className="md:col-span-2 space-y-6"><Skeleton className="h-96 rounded-2xl" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card border rounded-2xl p-6 text-center shadow-sm">
            <div className="w-24 h-24 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <UserCircle className="w-16 h-16" />
              )}
            </div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-muted-foreground flex items-center justify-center gap-2 mt-1">
              <Mail className="w-4 h-4" /> {profile.email}
            </p>
          </div>

          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Shopping Stats
            </h3>
            {loadingSummary ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : summary ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-2"><Package className="w-4 h-4" /> Total Orders</span>
                  <span className="font-bold">{summary.totalOrders}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-2"><Package className="w-4 h-4 text-blue-500" /> Pending</span>
                  <span className="font-bold">{summary.pendingOrders}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Total Spent</span>
                  <span className="font-bold text-primary">{formatPrice(summary.totalSpent)}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">Personal Information</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Phone className="w-4 h-4" /> Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 000-0000" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-6 border-t">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> Default Address
                  </h3>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} className="h-11" />
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
                              <Input placeholder="New York" {...field} className="h-11" />
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
                              <Input placeholder="United States" {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" size="lg" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
