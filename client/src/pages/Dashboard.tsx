import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Heart, User, CreditCard, MapPin, Clock, Upload, Image, Crown } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { getTierLimits } from "@shared/tierLimits";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  const { data: bookings, isLoading: bookingsLoading } = trpc.bookings.getByUserId.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: favorites, isLoading: favoritesLoading, refetch: refetchFavorites } = trpc.favorites.getByUserId.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: artistProfile } = trpc.artists.getByUserId.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const removeFavoriteMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      toast.success("Removed from favorites");
      refetchFavorites();
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/");
    }
  }, [loading, isAuthenticated, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-500";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "cancelled":
        return "bg-red-500/10 text-red-500";
      case "completed":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name || "User"}!
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={artistProfile ? "artist" : "bookings"} className="space-y-6">
          <TabsList className={`grid w-full ${artistProfile ? (getTierLimits(artistProfile.subscriptionTier as "free" | "premium").hasAnalytics ? 'max-w-2xl grid-cols-5' : 'max-w-lg grid-cols-4') : 'max-w-md grid-cols-3'}`}>
            {artistProfile && (
              <TabsTrigger value="artist">
                <User className="w-4 h-4 mr-2" />
                Artist
              </TabsTrigger>
            )}
            {artistProfile && getTierLimits(artistProfile.subscriptionTier as "free" | "premium").hasAnalytics && (
              <TabsTrigger value="analytics">
                <Crown className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            )}
            <TabsTrigger value="bookings">
              <Calendar className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="w-4 h-4 mr-2" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Artist Tab */}
          {artistProfile && (
            <TabsContent value="artist" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Artist Profile Card */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Your Artist Profile</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Shop Name:</span>
                      <p className="font-medium">{artistProfile.shopName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Subscription:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={artistProfile.subscriptionTier === 'premium' ? 'bg-primary' : ''}>
                          {artistProfile.subscriptionTier === 'premium' ? (
                            <>
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </>
                          ) : (
                            'Free'
                          )}
                        </Badge>
                        {artistProfile.subscriptionTier === 'free' && (
                          <Button size="sm" variant="outline" onClick={() => setLocation('/pricing')}>
                            Upgrade
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Total Reviews:</span>
                      <p className="font-medium">{artistProfile.totalReviews || 0}</p>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => setLocation(`/artist/${artistProfile.id}`)}
                  >
                    View Public Profile
                  </Button>
                </Card>

                {/* Portfolio Management Card */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Portfolio Management</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Portfolio Photos:</span>
                      <span className="font-medium">{artistProfile.portfolioCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Limit:</span>
                      <span className="font-medium">
                        {artistProfile.subscriptionTier === 'premium' ? 'Unlimited' : '3 photos'}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: artistProfile.subscriptionTier === 'premium'
                            ? '100%'
                            : `${Math.min((artistProfile.portfolioCount || 0) / 3 * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Button
                      className="w-full"
                      disabled={artistProfile.subscriptionTier === 'free' && (artistProfile.portfolioCount || 0) >= 3}
                      onClick={() => toast.info("Portfolio upload feature coming soon!")}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                    {artistProfile.subscriptionTier === 'free' && (artistProfile.portfolioCount || 0) >= 3 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setLocation('/pricing')}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade for More Photos
                      </Button>
                    )}
                  </div>
                </Card>
              </div>

              {/* Artist Bookings */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Client Bookings</h3>
                <p className="text-muted-foreground">Artist booking management coming soon...</p>
              </Card>
            </TabsContent>
          )}

          {/* Analytics Tab */}
          {artistProfile && getTierLimits(artistProfile.subscriptionTier as "free" | "premium").hasAnalytics && (
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Profile Views */}
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold">Profile Views</h3>
                      <p className="text-sm text-muted-foreground">Last 30 days</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary">1,247</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    <span className="text-green-600">+12%</span> from last month
                  </p>
                </Card>

                {/* Booking Requests */}
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold">Booking Requests</h3>
                      <p className="text-sm text-muted-foreground">Last 30 days</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary">23</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    <span className="text-green-600">+8%</span> from last month
                  </p>
                </Card>

                {/* Average Rating */}
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold">Average Rating</h3>
                      <p className="text-sm text-muted-foreground">All time</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {artistProfile.averageRating ? parseFloat(artistProfile.averageRating).toFixed(1) : "0.0"}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on {artistProfile.totalReviews || 0} reviews
                  </p>
                </Card>

                {/* Top Referral Sources */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Top Referral Sources</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Direct Search</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Social Media</span>
                      <span className="font-medium">28%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Google Search</span>
                      <span className="font-medium">18%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Other</span>
                      <span className="font-medium">9%</span>
                    </div>
                  </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6 md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New booking request</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Profile viewed 12 times</p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New review received</p>
                        <p className="text-xs text-muted-foreground">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">My Bookings</h2>
              <Button onClick={() => setLocation("/artist-finder")}>
                <Calendar className="w-4 h-4 mr-2" />
                New Booking
              </Button>
            </div>

            {bookingsLoading ? (
              <p className="text-muted-foreground">Loading bookings...</p>
            ) : bookings && bookings.length > 0 ? (
              <div className="grid gap-4">
                {bookings.map((item) => (
                  <Card key={item.booking.id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold">
                            {item.artist?.shopName || "Unknown Artist"}
                          </h3>
                          <Badge className={getStatusColor(item.booking.status)}>
                            {item.booking.status}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(item.booking.preferredDate).toLocaleString()}
                            </span>
                          </div>
                          
                          {item.artist?.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {item.artist.address}, {item.artist.city}, {item.artist.state}
                              </span>
                            </div>
                          )}

                          <div className="mt-3">
                            <p className="font-medium text-foreground">Tattoo Description:</p>
                            <p className="mt-1">{item.booking.tattooDescription}</p>
                          </div>

                          <div className="flex gap-4 mt-2">
                            <div>
                              <span className="font-medium text-foreground">Placement:</span>{" "}
                              {item.booking.placement}
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Size:</span>{" "}
                              {item.booking.size}
                            </div>
                          </div>

                          {item.booking.depositPaid === 1 && (
                            <div className="flex items-center gap-2 text-green-600 mt-2">
                              <CreditCard className="w-4 h-4" />
                              <span className="font-medium">Deposit Paid: ${(item.booking.depositAmount || 0) / 100}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {item.artist && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/artist/${item.artist!.id}`)}
                          >
                            View Artist
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by finding an artist and booking your first appointment
                </p>
                <Button onClick={() => setLocation("/artist-finder")}>
                  Find Artists
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Favorite Artists</h2>

            {favoritesLoading ? (
              <p className="text-muted-foreground">Loading favorites...</p>
            ) : favorites && favorites.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((item) => {
                  if (!item.artist) return null;
                  
                  const avgRating = item.artist.averageRating
                    ? parseFloat(item.artist.averageRating)
                    : 0;

                  return (
                    <Card key={item.favorite.id} className="p-6">
                      <h3 className="text-lg font-semibold mb-2">
                        {item.artist.shopName}
                      </h3>
                      
                      {item.artist.city && (
                        <p className="text-sm text-muted-foreground mb-3">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {item.artist.city}, {item.artist.state}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-sm ${
                                star <= avgRating ? "text-primary" : "text-muted-foreground"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({item.artist.totalReviews})
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => setLocation(`/artist/${item.artist!.id}`)}
                        >
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFavoriteMutation.mutate({ artistId: item.artist!.id })}
                        >
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No favorite artists yet</h3>
                <p className="text-muted-foreground mb-4">
                  Save your favorite artists to quickly access them later
                </p>
                <Button onClick={() => setLocation("/artist-finder")}>
                  Browse Artists
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">My Profile</h2>

            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-lg">{user.name || "Not set"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-lg">{user.email || "Not set"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <Badge>{user.role}</Badge>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <p className="text-lg">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
