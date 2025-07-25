import { useState } from "react";
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
  Bell
} from "lucide-react";
import { Link } from "react-router-dom";

export default function VendorDashboard() {
  const [notifications] = useState([
    { id: 1, message: "New cluster formed for tomatoes - Save 25%!", type: "success" },
    { id: 2, message: "Flash deal: Onions at ₹15/kg for next 2 hours", type: "warning" },
  ]);

  const todaysDeals = [
    {
      item: "Tomatoes",
      normalPrice: 35,
      clusteredPrice: 26,
      savings: 26,
      vendors: 4,
      timeLeft: "2h 30m",
      supplier: "Fresh Farm Co."
    },
    {
      item: "Onions",
      normalPrice: 20,
      clusteredPrice: 15,
      savings: 25,
      vendors: 6,
      timeLeft: "45m",
      supplier: "Valley Produce"
    },
    {
      item: "Potatoes",
      normalPrice: 18,
      clusteredPrice: 14,
      savings: 22,
      vendors: 3,
      timeLeft: "4h 15m",
      supplier: "Green Harvest"
    },
  ];

  const recentOrders = [
    {
      id: "ORD001",
      items: "Tomatoes 5kg, Onions 3kg",
      total: 195,
      status: "delivered",
      date: "Today"
    },
    {
      id: "ORD002", 
      items: "Potatoes 8kg, Oil 2L",
      total: 340,
      status: "in_transit",
      date: "Yesterday"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-success text-success-foreground';
      case 'in_transit': return 'bg-warning text-warning-foreground';
      case 'pending': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation userRole="vendor" onLogout={() => window.location.href = '/'} />
      
      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Good morning, Rajesh!</h1>
            <p className="text-muted-foreground">Here's what's happening with your sourcing today</p>
          </div>
          <Link to="/vendor/needs">
            <Button className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4" />
              <span>Add Daily Needs</span>
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
                  notif.type === 'success' 
                    ? 'bg-success/10 border-l-success' 
                    : 'bg-warning/10 border-l-warning'
                }`}
              >
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{notif.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Savings</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">₹247</div>
              <p className="text-xs text-muted-foreground">+23% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clusters</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">2 with active deals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Package className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">1 arriving today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹1,340</div>
              <p className="text-xs text-muted-foreground">Total spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Deals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Today's Cluster Deals</span>
            </CardTitle>
            <CardDescription>
              Join vendor clusters to unlock these special prices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {todaysDeals.map((deal, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold">{deal.item}</h4>
                      <Badge variant="secondary">{deal.vendors} vendors</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {deal.timeLeft}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-muted-foreground line-through">₹{deal.normalPrice}/kg</span>
                      <span className="font-semibold text-success">₹{deal.clusteredPrice}/kg</span>
                      <Badge className="bg-success/10 text-success border-success">
                        {deal.savings}% OFF
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {deal.supplier}
                    </div>
                  </div>
                  <Button size="sm">Join Cluster</Button>
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
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.items}</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{order.total}</p>
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