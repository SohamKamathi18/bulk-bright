import { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  MapPin,
  Bell,
  Eye,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SupplierDashboard() {
  const [notifications] = useState([
    { id: 1, message: "New cluster demand: 25kg tomatoes in Sector 14", type: "info" },
    { id: 2, message: "Urgent: 15kg onions needed within 2 hours", type: "urgent" },
  ]);

  const activeClusters = [
    {
      id: 'CL001',
      item: 'Tomatoes',
      totalQuantity: 25,
      vendors: 5,
      currentOffers: 3,
      bestPrice: 28,
      yourPrice: 26,
      timeLeft: '1h 45m',
      location: 'Sector 14, 2km radius',
      urgency: 'medium'
    },
    {
      id: 'CL002',
      item: 'Onions', 
      totalQuantity: 18,
      vendors: 4,
      currentOffers: 2,
      bestPrice: 17,
      yourPrice: 15,
      timeLeft: '45m',
      location: 'Market Area, 1.5km radius',
      urgency: 'high'
    },
    {
      id: 'CL003',
      item: 'Potatoes',
      totalQuantity: 35,
      vendors: 7,
      currentOffers: 4,
      bestPrice: 16,
      yourPrice: null,
      timeLeft: '3h 20m', 
      location: 'Industrial Zone, 3km radius',
      urgency: 'low'
    }
  ];

  const recentOrders = [
    {
      id: 'ORD101',
      cluster: 'CL001',
      item: 'Tomatoes',
      quantity: 25,
      totalValue: 650,
      vendors: 5,
      status: 'dispatched',
      deliveryTime: '2 hours'
    },
    {
      id: 'ORD102',
      cluster: 'CL004', 
      item: 'Onions',
      quantity: 20,
      totalValue: 300,
      vendors: 4,
      status: 'delivered',
      deliveryTime: 'Completed'
    }
  ];

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation userRole="supplier" onLogout={() => window.location.href = '/'} />
      
      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Good morning, Fresh Farm Co.!</h1>
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
              <div className="text-2xl font-bold text-success">₹8,450</div>
              <p className="text-xs text-muted-foreground">+18% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clusters</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">2 with your offers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Package className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">To be dispatched</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Clusters */}
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
            <div className="space-y-4">
              {activeClusters.map((cluster) => (
                <div key={cluster.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-lg">{cluster.item}</h4>
                      <Badge className={getUrgencyColor(cluster.urgency)}>
                        {cluster.urgency}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {cluster.timeLeft}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{cluster.totalQuantity}kg needed</p>
                      <p className="text-sm text-muted-foreground">{cluster.vendors} vendors</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{cluster.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{cluster.currentOffers} offers submitted</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Best: ₹{cluster.bestPrice}/kg</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {cluster.yourPrice ? (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm font-medium">Your offer: ₹{cluster.yourPrice}/kg</span>
                          {cluster.yourPrice <= cluster.bestPrice && (
                            <Badge className="bg-success/10 text-success border-success">Winning</Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No offer submitted</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm">
                        {cluster.yourPrice ? 'Update Offer' : 'Submit Offer'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="font-medium">#{order.id}</span>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.item} - {order.quantity}kg for {order.vendors} vendors
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