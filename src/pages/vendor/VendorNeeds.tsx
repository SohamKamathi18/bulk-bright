import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Users, Clock, MapPin, TrendingUp, ShoppingCart, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface RawMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  urgency: 'low' | 'medium' | 'high';
  preferredTime?: string;
}

export default function VendorNeeds() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [newMaterial, setNewMaterial] = useState<Partial<RawMaterial>>({ name: '', quantity: 0, unit: 'kg', urgency: 'medium' });
  const [isSearchingClusters, setIsSearchingClusters] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setMaterials([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const docRef = doc(db, "vendor_needs", userId);
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setMaterials(docSnap.data().materials || []);
      } else {
        setMaterials([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  const commonItems = [
    'Tomatoes', 'Onions', 'Potatoes', 'Carrots', 'Cabbage', 
    'Cooking Oil', 'Rice', 'Wheat Flour', 'Sugar', 'Salt'
  ];

  const addMaterial = async () => {
    if (!newMaterial.name || !newMaterial.quantity) {
      toast({
        title: "Missing Information",
        description: "Please enter item name and quantity",
        variant: "destructive",
      });
      return;
    }
    if (!userId) {
      toast({ title: "Not logged in", description: "Please log in first.", variant: "destructive" });
      return;
    }
    const material: RawMaterial = {
      id: Date.now().toString(),
      name: newMaterial.name,
      quantity: newMaterial.quantity,
      unit: newMaterial.unit || 'kg',
      urgency: newMaterial.urgency || 'medium'
    };
    try {
      const docRef = doc(db, "vendor_needs", userId);
      await setDoc(docRef, { materials: arrayUnion(material) }, { merge: true });
      setNewMaterial({ name: '', quantity: 0, unit: 'kg', urgency: 'medium' });
      toast({ title: "Item Added", description: `${material.name} added to your daily needs` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add item.", variant: "destructive" });
    }
  };

  const removeMaterial = async (id: string) => {
    if (!userId) return;
    try {
      const docRef = doc(db, "vendor_needs", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const updated = (docSnap.data().materials || []).filter((m: RawMaterial) => m.id !== id);
        await updateDoc(docRef, { materials: updated });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to remove item.", variant: "destructive" });
    }
  };

  const searchForClusters = async () => {
    setIsSearchingClusters(true);
    // Placeholder for real cluster search logic
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSearchingClusters(false);
    toast({ title: "Clusters Found!", description: `Cluster search is not yet implemented.` });
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
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Daily Raw Material Needs</h1>
          <p className="text-muted-foreground">Enter your requirements to find vendor clusters and better prices</p>
        </div>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Today's Requirements ({materials.length} items)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : materials.length === 0 ? (
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
        {/* Cluster Matches (placeholder, not implemented) */}
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