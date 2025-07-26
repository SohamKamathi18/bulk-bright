import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, where, getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  Package, 
  DollarSign, 
  Truck, 
  Clock, 
  Users, 
  MapPin, 
  AlertTriangle,
  Send,
  Eye,
  Calendar,
  Scale
} from "lucide-react";

interface RawMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  urgency: 'low' | 'medium' | 'high';
  preferredTime?: string;
}

interface VendorNeed {
  id: string;
  vendorId: string;
  materials: RawMaterial[];
  createdAt: string;
  vendorProfile?: any;
}

interface SupplierOffer {
  id: string;
  supplierId: string;
  vendorNeedId: string;
  totalPrice: number;
  deliveryTime: string;
  deliveryMode: string;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const deliveryModes = [
  "Door Delivery", "Bulk Pickup", "Warehouse Pickup", "Express Delivery", "Scheduled Delivery"
];

const urgencyColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800"
};

export default function SubmitOffers() {
  const [vendorNeeds, setVendorNeeds] = useState<VendorNeed[]>([]);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [supplierProfile, setSupplierProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNeed, setSelectedNeed] = useState<VendorNeed | null>(null);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [myOffers, setMyOffers] = useState<SupplierOffer[]>([]);

  // Offer form state
  const [offerForm, setOfferForm] = useState({
    totalPrice: "",
    deliveryTime: "",
    deliveryMode: "",
    notes: ""
  });

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

  // Fetch vendor needs
  useEffect(() => {
    const q = collection(db, "vendor_needs");
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const needs: VendorNeed[] = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.materials && Array.isArray(data.materials)) {
          // Fetch vendor profile
          let vendorProfile = null;
          try {
            const vendorProfileRef = doc(db, "vendor_profiles", docSnap.id);
            const vendorProfileSnap = await getDoc(vendorProfileRef);
            if (vendorProfileSnap.exists()) {
              vendorProfile = vendorProfileSnap.data();
            }
          } catch (error) {
            console.error("Error fetching vendor profile:", error);
          }

          needs.push({
            id: docSnap.id,
            vendorId: docSnap.id,
            materials: data.materials,
            createdAt: data.createdAt || docSnap.createTime?.toDate().toISOString(),
            vendorProfile
          });
        }
      }
      setVendorNeeds(needs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch my offers
  useEffect(() => {
    if (!supplierId) return;

    const q = query(collection(db, "supplier_offers"), where("supplierId", "==", supplierId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const offers: SupplierOffer[] = [];
      snapshot.forEach((doc) => {
        offers.push({ id: doc.id, ...doc.data() } as SupplierOffer);
      });
      setMyOffers(offers);
    });

    return () => unsubscribe();
  }, [supplierId]);

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !selectedNeed) return;

    if (!offerForm.totalPrice || !offerForm.deliveryTime || !offerForm.deliveryMode) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addDoc(collection(db, "supplier_offers"), {
        supplierId,
        vendorNeedId: selectedNeed.id,
        totalPrice: parseFloat(offerForm.totalPrice),
        deliveryTime: offerForm.deliveryTime,
        deliveryMode: offerForm.deliveryMode,
        notes: offerForm.notes,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      toast({
        title: "Offer Submitted!",
        description: "Your offer has been submitted successfully."
      });

      setIsOfferDialogOpen(false);
      setSelectedNeed(null);
      setOfferForm({
        totalPrice: "",
        deliveryTime: "",
        deliveryMode: "",
        notes: ""
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit offer.",
        variant: "destructive"
      });
    }
  };

  const getMyOfferForNeed = (needId: string) => {
    return myOffers.find(offer => offer.vendorNeedId === needId);
  };

  const calculateTotalQuantity = (materials: RawMaterial[]) => {
    return materials.reduce((total, material) => total + material.quantity, 0);
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-green-500" />;
    }
  };

  const isInMyServiceArea = (vendorNeed: VendorNeed) => {
    if (!supplierProfile?.serviceAreaPin || !vendorNeed.vendorProfile?.pinCode) {
      return true; // Show all if service area not set
    }
    return supplierProfile.serviceAreaPin === vendorNeed.vendorProfile.pinCode;
  };

  const filteredNeeds = vendorNeeds.filter(isInMyServiceArea);

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
            <h1 className="text-3xl font-bold text-foreground">Submit Offers</h1>
            <p className="text-muted-foreground">View vendor needs and submit competitive offers</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Needs</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredNeeds.length}</div>
              <p className="text-xs text-muted-foreground">Vendor needs in your area</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Offers</CardTitle>
              <Send className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{myOffers.length}</div>
              <p className="text-xs text-muted-foreground">Offers submitted</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {myOffers.filter(offer => offer.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {myOffers.filter(offer => offer.status === 'accepted').length}
              </div>
              <p className="text-xs text-muted-foreground">Successful offers</p>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Needs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Vendor Needs</span>
            </CardTitle>
            <CardDescription>
              View vendor requirements and submit competitive offers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading vendor needs...</div>
            ) : filteredNeeds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No vendor needs found in your service area.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNeeds.map((need) => {
                  const myOffer = getMyOfferForNeed(need.id);
                  const totalQuantity = calculateTotalQuantity(need.materials);
                  
                  return (
                    <Card key={need.id} className="relative">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {need.vendorProfile?.fullName || 'Vendor'}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            {need.materials.map((material) => (
                              <Badge 
                                key={material.id} 
                                className={urgencyColors[material.urgency]}
                              >
                                {getUrgencyIcon(material.urgency)}
                                <span className="ml-1">{material.urgency}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <CardDescription className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>PIN: {need.vendorProfile?.pinCode || 'N/A'}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Required Items:</h4>
                          <div className="space-y-2">
                            {need.materials.map((material) => (
                              <div key={material.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  <Package className="w-4 h-4 text-muted-foreground" />
                                  <span>{material.name}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Scale className="w-3 h-3 text-muted-foreground" />
                                  <span>{material.quantity} {material.unit}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Total Quantity: {totalQuantity} units</span>
                          <span>{new Date(need.createdAt).toLocaleDateString()}</span>
                        </div>

                        {myOffer ? (
                          <div className="space-y-2">
                            <Badge 
                              variant={myOffer.status === 'accepted' ? 'default' : 
                                     myOffer.status === 'rejected' ? 'destructive' : 'secondary'}
                            >
                              {myOffer.status === 'accepted' ? 'Accepted' : 
                               myOffer.status === 'rejected' ? 'Rejected' : 'Pending'}
                            </Badge>
                            <div className="text-sm">
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-3 h-3" />
                                <span>₹{myOffer.totalPrice}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Truck className="w-3 h-3" />
                                <span>{myOffer.deliveryMode}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => {
                              setSelectedNeed(need);
                              setIsOfferDialogOpen(true);
                            }}
                            className="w-full"
                          >
                            Submit Offer
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Submit Offer Dialog */}
      <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Offer</DialogTitle>
          </DialogHeader>
          {selectedNeed && (
            <form onSubmit={handleSubmitOffer} className="space-y-4">
              <div className="space-y-2">
                <Label>Vendor</Label>
                <div className="text-sm text-muted-foreground">
                  {selectedNeed.vendorProfile?.fullName || 'Vendor'}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Required Items</Label>
                <div className="space-y-1">
                  {selectedNeed.materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between text-sm">
                      <span>{material.name}</span>
                      <span>{material.quantity} {material.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalPrice">Total Price (₹) *</Label>
                <Input
                  id="totalPrice"
                  type="number"
                  step="0.01"
                  value={offerForm.totalPrice}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, totalPrice: e.target.value }))}
                  placeholder="Enter total price for all items"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Delivery Time *</Label>
                <Input
                  id="deliveryTime"
                  value={offerForm.deliveryTime}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, deliveryTime: e.target.value }))}
                  placeholder="e.g., 2 hours, Same day, Next morning"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryMode">Delivery Mode *</Label>
                <Select value={offerForm.deliveryMode} onValueChange={(v) => setOfferForm(prev => ({ ...prev, deliveryMode: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryModes.map(mode => (
                      <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={offerForm.notes}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information about your offer"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOfferDialogOpen(false);
                    setSelectedNeed(null);
                    setOfferForm({
                      totalPrice: "",
                      deliveryTime: "",
                      deliveryMode: "",
                      notes: ""
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Offer
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 