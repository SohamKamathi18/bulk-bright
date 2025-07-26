import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Package, TrendingUp, Users, Clock, DollarSign, MapPin, Bell, Eye, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, query, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface RawMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  urgency: 'low' | 'medium' | 'high';
  preferredTime?: string;
}

interface VendorNeedsDoc {
  materials: RawMaterial[];
  vendorId: string;
}

interface SupplierNotification {
  id: string;
  message: string;
  type: string;
}

interface SupplierOrder {
  id: string;
  cluster: string;
  item: string;
  quantity: number;
  totalValue: number;
  vendors: number;
  status: string;
  deliveryTime: string;
}

export default function SupplierDashboard() {
  const [vendorNeeds, setVendorNeeds] = useState<VendorNeedsDoc[]>([]);
  const [notifications, setNotifications] = useState<SupplierNotification[]>([]);
  const [recentOrders, setRecentOrders] = useState<SupplierOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [supplierProfile, setSupplierProfile] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setSupplierId(user.uid);
        // Fetch supplier profile
        const profileRef = doc(db, "supplier_profiles", user.uid);
        getDoc(profileRef).then((profileSnap) => {
          if (profileSnap.exists()) {
            setSupplierProfile(profileSnap.data());
          }
        });
      } else {
        setSupplierId(null);
        setSupplierProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch all vendor needs (live clusters)
  useEffect(() => {
    setLoading(true);
    const q = collection(db, "vendor_needs");
    const unsub = onSnapshot(q, (snapshot) => {
      const needs: VendorNeedsDoc[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.materials && Array.isArray(data.materials)) {
          needs.push({ materials: data.materials, vendorId: docSnap.id });
        }
      });
      setVendorNeeds(needs);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Fetch supplier notifications
  useEffect(() => {
    if (!supplierId) return;
    const q = collection(db, "supplier_notifications");
    const unsub = onSnapshot(q, (snapshot) => {
      const notifs: SupplierNotification[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.supplierId === supplierId) {
          notifs.push({ id: docSnap.id, message: data.message, type: data.type });
        }
      });
      setNotifications(notifs);
    });
    return () => unsub();
  }, [supplierId]);

  // Fetch supplier recent orders
  useEffect(() => {
    if (!supplierId) return;
    const q = collection(db, "supplier_orders");
    const unsub = onSnapshot(q, (snapshot) => {
      const orders: SupplierOrder[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.supplierId === supplierId) {
          orders.push({
            id: docSnap.id,
            cluster: data.cluster,
            item: data.item,
            quantity: data.quantity,
            totalValue: data.totalValue,
            vendors: data.vendors,
            status: data.status,
            deliveryTime: data.deliveryTime,
          });
        }
      });
      setRecentOrders(orders);
    });
    return () => unsub();
  }, [supplierId]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-success text-success-foreground';
      case 'dispatched': return 'bg-warning text-warning-foreground';
      case 'pending': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Stats (example: count clusters, orders, etc.)
  const totalClusters = vendorNeeds.reduce((acc, doc) => acc + doc.materials.length, 0);
  const totalOrders = recentOrders.length;
  const totalRevenue = recentOrders.reduce((acc, order) => acc + (order.totalValue || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        userRole="supplier" 
        onLogout={() => window.location.href = '/'} 
        userName={supplierProfile?.contactPersonName}
      />
      <main className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Good morning, {supplierProfile?.contactPersonName || 'Supplier'}!
            </h1>
            <p className="text-muted-foreground">Manage your inventory and respond to vendor clusters</p>
          </div>
          <Link to="/supplier/inventory">
            <Button className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Manage Inventory</span>
            </Button>
          </Link>
        </div>
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`p-3 rounded-lg border-l-4 flex items-center space-x-3 ${
                  notif.type === 'urgent' 
                    ? 'bg-destructive/10 border-l-destructive' 
                    : 'bg-primary/10 border-l-primary'
                }`}
              >
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{notif.message}</span>
                <Button size="sm" variant="ghost">View</Button>
              </div>
            ))}
          </div>
        )}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">₹{totalRevenue}</div>
              <p className="text-xs text-muted-foreground">Total revenue from orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clusters</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClusters}</div>
              <p className="text-xs text-muted-foreground">Vendor needs to fulfill</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Package className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentOrders.filter(o => o.status === 'pending' || o.status === 'dispatched').length}</div>
              <p className="text-xs text-muted-foreground">To be dispatched</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>
        {/* Active Clusters (Vendor Needs) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Live Vendor Clusters</span>
            </CardTitle>
            <CardDescription>
              Real-time demand from vendor groups. Submit your best offers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : vendorNeeds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No vendor needs found.</div>
            ) : (
              <div className="space-y-4">
                {vendorNeeds.map((doc) => (
                  doc.materials.map((material) => (
                    <div key={material.id + doc.vendorId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-lg">{material.name}</h4>
                          <Badge className={getUrgencyColor(material.urgency)}>
                            {material.urgency}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{material.quantity} {material.unit} needed</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-muted-foreground">Vendor: {doc.vendorId}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button size="sm">
                            Submit Offer
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Recent Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No orders found.</div>
              ) : recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="font-medium">#{order.id}</span>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.item} - {order.quantity} for {order.vendors} vendors
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Delivery: {order.deliveryTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{order.totalValue}</p>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}