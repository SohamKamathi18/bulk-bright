import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Users, TrendingUp, MapPin, Clock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-glow to-accent py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <TrendingUp className="w-4 h-4 text-white mr-2" />
            <span className="text-white text-sm font-medium">Revolutionizing Street Vendor Sourcing</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Source Smarter,<br />
            <span className="text-accent">Save Together</span>
          </h1>
          
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Enable street vendors to source affordable, trusted raw materials through collective buying 
            and real-time supplier competition. Get better prices, reliable quality, and flexible delivery.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?role=vendor">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-3">
                <Users className="w-5 h-5 mr-2" />
                Join as Vendor
              </Button>
            </Link>
            <Link to="/auth?role=supplier">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-3 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Join as Supplier
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How VendorLink Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A seamless platform connecting street vendors and suppliers for better sourcing outcomes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Auto-Clustering</CardTitle>
                <CardDescription>
                  Smart algorithm groups nearby vendors with similar needs for bulk purchasing power
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <DollarSign className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-xl">Competitive Pricing</CardTitle>
                <CardDescription>
                  Real-time supplier competition ensures you get the best prices for your raw materials
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-success/20 transition-colors">
                  <MapPin className="w-8 h-8 text-success" />
                </div>
                <CardTitle className="text-xl">Flexible Delivery</CardTitle>
                <CardDescription>
                  Choose individual delivery or shared pickup points for maximum convenience
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-foreground mb-6">
                Benefits for Street Vendors
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Lower Costs</h4>
                    <p className="text-muted-foreground">Save 20-40% on raw materials through collective buying power</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Save Time</h4>
                    <p className="text-muted-foreground">No more haggling or searching - get matched automatically</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Better Profits</h4>
                    <p className="text-muted-foreground">Built-in profit calculator helps optimize your margins</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-foreground mb-6">
                Benefits for Suppliers
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Bulk Orders</h4>
                    <p className="text-muted-foreground">Access to grouped orders from multiple vendors</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Efficient Delivery</h4>
                    <p className="text-muted-foreground">Optimize routes with clustered vendor locations</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Steady Income</h4>
                    <p className="text-muted-foreground">Predictable demand from vendor clusters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-primary-glow">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of vendors and suppliers already saving money and time with VendorLink
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?role=vendor">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-3">
                Start as Vendor
              </Button>
            </Link>
            <Link to="/auth?role=supplier">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-3 bg-white/10 border-white/20 text-white hover:bg-white/20">
                Start as Supplier
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}