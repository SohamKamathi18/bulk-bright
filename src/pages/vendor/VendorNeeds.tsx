import { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Trash2, 
  Users, 
  Clock, 
  MapPin, 
  TrendingUp,
  ShoppingCart,
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface RawMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  urgency: 'low' | 'medium' | 'high';
  preferredTime?: string;
}

export default function VendorNeeds() {
  const [materials, setMaterials] = useState<RawMaterial[]>([
    { id: '1', name: 'Tomatoes', quantity: 5, unit: 'kg', urgency: 'high' },
    { id: '2', name: 'Onions', quantity: 3, unit: 'kg', urgency: 'medium' },
  ]);

  const [newMaterial, setNewMaterial] = useState<Partial<RawMaterial>>({
    name: '',
    quantity: 0,
    unit: 'kg',
    urgency: 'medium'
  });

  const [isSearchingClusters, setIsSearchingClusters] = useState(false);

  const clusterMatches = [
    {
      item: 'Tomatoes',
      vendors: 4,
      totalQuantity: 18,
      estimatedSavings: 26,
      deliveryTime: '2-3 hours',
      location: 'Within 2km radius'
    },
    {
      item: 'Onions', 
      vendors: 6,
      totalQuantity: 25,
      estimatedSavings: 31,
      deliveryTime: '1-2 hours',
      location: 'Within 1.5km radius'
    }
  ];

  const commonItems = [
    'Tomatoes', 'Onions', 'Potatoes', 'Carrots', 'Cabbage', 
    'Cooking Oil', 'Rice', 'Wheat Flour', 'Sugar', 'Salt'
  ];

  const addMaterial = () => {
    if (!newMaterial.name || !newMaterial.quantity) {
      toast({
        title: "Missing Information",
        description: "Please enter item name and quantity",
        variant: "destructive",
      });
      return;
    }

    const material: RawMaterial = {
      id: Date.now().toString(),
      name: newMaterial.name,
      quantity: newMaterial.quantity,
      unit: newMaterial.unit || 'kg',
      urgency: newMaterial.urgency || 'medium'
    };

    setMaterials([...materials, material]);
    setNewMaterial({ name: '', quantity: 0, unit: 'kg', urgency: 'medium' });
    
    toast({
      title: "Item Added",
      description: `${material.name} added to your daily needs`,
    });
  };

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const searchForClusters = async () => {
    setIsSearchingClusters(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSearchingClusters(false);
    toast({
      title: "Clusters Found!",
      description: `Found ${clusterMatches.length} active clusters matching your needs`,
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation userRole="vendor" onLogout={() => window.location.href = '/'} />
      
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Daily Raw Material Needs</h1>
          <p className="text-muted-foreground">Enter your requirements to find vendor clusters and better prices</p>
        </div>

        {/* Add New Material */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add Raw Material</span>
            </CardTitle>
            <CardDescription>
              Add items you need for today's business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-name">Item Name</Label>
                <Select 
                  value={newMaterial.name} 
                  onValueChange={(value) => setNewMaterial({...newMaterial, name: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonItems.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newMaterial.quantity || ''}
                  onChange={(e) => setNewMaterial({...newMaterial, quantity: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select 
                  value={newMaterial.unit} 
                  onValueChange={(value) => setNewMaterial({...newMaterial, unit: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="packets">Packets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency</Label>
                <Select 
                  value={newMaterial.urgency} 
                  onValueChange={(value: 'low' | 'medium' | 'high') => setNewMaterial({...newMaterial, urgency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={addMaterial} className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add to List
            </Button>
          </CardContent>
        </Card>

        {/* Current Materials List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Today's Requirements ({materials.length} items)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {materials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No items added yet. Add your daily requirements above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((material) => (
                  <div key={material.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-medium">{material.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {material.quantity} {material.unit}
                        </p>
                      </div>
                      <Badge className={getUrgencyColor(material.urgency)}>
                        {material.urgency}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeMaterial(material.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <Button 
                    onClick={searchForClusters} 
                    className="w-full" 
                    disabled={isSearchingClusters}
                  >
                    {isSearchingClusters ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Searching for clusters...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Find Vendor Clusters
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cluster Matches */}
        {!isSearchingClusters && materials.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Available Clusters</span>
              </CardTitle>
              <CardDescription>
                Join these vendor clusters to get better prices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clusterMatches.map((match, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">{match.item}</h4>
                      <Badge className="bg-success/10 text-success border-success">
                        {match.estimatedSavings}% savings
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{match.vendors} vendors</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{match.deliveryTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{match.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total quantity: {match.totalQuantity}kg
                        </p>
                        <Progress value={75} className="w-32 h-2 mt-1" />
                        <p className="text-xs text-muted-foreground mt-1">75% filled</p>
                      </div>
                      <Button>Join Cluster</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-medium">Pro Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Add items early in the day for better cluster matches</li>
                  <li>• High urgency items get priority in supplier offers</li>
                  <li>• Flexible delivery times increase your cluster options</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}