import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  Package,
  MapPin,
  Bell,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { db, auth } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface VendorProfile {
  fullName: string;
  businessType: string;
  businessName?: string;
  phone: string;
  email?: string;
  pinCode: string;
  preferredDelivery: string;
  avgDailyNeeds: string[];
  language: string;
}

interface RawMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  urgency: 'low' | 'medium' | 'high';
  preferredTime?: string;
}

export default function VendorDashboard() {
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [vendorNeeds, setVendorNeeds] = useState<RawMaterial[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setVendorProfile(null);
        setVendorNeeds([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch vendor profile
  useEffect(() => {
    if (!userId) return;
    const profileRef = doc(db, "vendor_profiles", userId);
    const unsub = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setVendorProfile(docSnap.data() as VendorProfile);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  // Fetch vendor needs
  useEffect(() => {
    if (!userId) return;
    const needsRef = doc(db, "vendor_needs", userId);
    const unsub = onSnapshot(needsRef, (docSnap) => {
      if (docSnap.exists()) {
        setVendorNeeds(docSnap.data().materials || []);
      } else {
        setVendorNeeds([]);
      }
    });
    return () => unsub();
  }, [userId]);

  // Fetch received offers
  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, "supplier_offers"), where("vendorNeedId", "==", userId));
    const unsub = onSnapshot(q, (snapshot) => {
      const offers: any[] = [];
      snapshot.forEach((doc) => {
        offers.push({ id: doc.id, ...doc.data() });
      });
      setReceivedOffers(offers);
    });
    return () => unsub();
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-success text-success-foreground';
      case 'in_transit': return 'bg-warning text-warning-foreground';
      case 'pending': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        userRole="vendor" 
        onLogout={() => window.location.href = '/'} 
        userName={vendorProfile?.fullName}
      />
      
      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Good morning, {vendorProfile?.fullName || 'Vendor'}!
            </h1>
            <p className="text-muted-foreground">Here's what's happening with your sourcing today</p>
          </div>
          <Link to="/vendor/needs">
            <Button className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4" />
              <span>Add Daily Needs</span>
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Needs</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{vendorNeeds.length}</div>
              <p className="text-xs text-muted-foreground">Items added today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Business Type</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendorProfile?.businessType || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Your business</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Location</CardTitle>
              <MapPin className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendorProfile?.pinCode || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">PIN Code</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery</CardTitle>
              <Package className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendorProfile?.preferredDelivery || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Preferred method</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Received Offers</CardTitle>
              <Package className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{receivedOffers.length}</div>
              <p className="text-xs text-muted-foreground">From suppliers</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Needs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Today's Needs</span>
            </CardTitle>
            <CardDescription>
              Your current requirements for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vendorNeeds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No items added yet. Add your daily requirements to get started.</p>
                <Link to="/vendor/needs">
                  <Button className="mt-4">Add Needs</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {vendorNeeds.map((need) => (
                  <div key={need.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold">{need.name}</h4>
                        <Badge variant="secondary">{need.urgency}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="font-semibold">{need.quantity} {need.unit}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Offers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Recent Offers</span>
              </div>
              <Link to="/vendor/offers">
                <Button variant="outline" size="sm">
                  View All Offers
                </Button>
              </Link>
            </div>
            <CardDescription>
              Latest offers from suppliers for your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {receivedOffers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No offers received yet. Suppliers will submit offers for your needs.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedOffers.slice(0, 3).map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold">₹{offer.totalPrice}</h4>
                        <Badge variant={offer.status === 'pending' ? 'secondary' : 
                                       offer.status === 'accepted' ? 'default' : 'destructive'}>
                          {offer.status === 'pending' ? 'Pending' : 
                           offer.status === 'accepted' ? 'Accepted' : 'Rejected'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{offer.deliveryMode}</span>
                        <span>•</span>
                        <span>{offer.deliveryTime}</span>
                      </div>
                    </div>
                    <Link to="/vendor/offers">
                      <Button size="sm" variant="outline">View Details</Button>
                    </Link>
                  </div>
                ))}
                {receivedOffers.length > 3 && (
                  <div className="text-center pt-4">
                    <Link to="/vendor/offers">
                      <Button variant="ghost">View {receivedOffers.length - 3} more offers</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}