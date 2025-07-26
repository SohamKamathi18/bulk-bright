import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, query, where, updateDoc, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  Package, 
  DollarSign, 
  Truck, 
  Clock, 
  Building2, 
  MapPin, 
  CheckCircle,
  XCircle,
  Eye,
  Phone,
  Mail
} from "lucide-react";
import { Label } from "@/components/ui/label";

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
  supplierProfile?: any;
}

interface VendorNeed {
  id: string;
  materials: any[];
  createdAt: string;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800"
};

export default function VendorOffers() {
  const [offers, setOffers] = useState<SupplierOffer[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<SupplierOffer | null>(null);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setVendorId(user.uid);
        // Fetch vendor profile
        const profileRef = doc(db, "vendor_profiles", user.uid);
        getDoc(profileRef).then((profileSnap) => {
          if (profileSnap.exists()) {
            setVendorProfile(profileSnap.data());
          }
        });
      } else {
        setVendorId(null);
        setVendorProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch offers for this vendor
  useEffect(() => {
    if (!vendorId) return;

    const q = query(collection(db, "supplier_offers"), where("vendorNeedId", "==", vendorId));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const offersData: SupplierOffer[] = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        // Fetch supplier profile
        let supplierProfile = null;
        try {
          const supplierProfileRef = doc(db, "supplier_profiles", data.supplierId);
          const supplierProfileSnap = await getDoc(supplierProfileRef);
          if (supplierProfileSnap.exists()) {
            supplierProfile = supplierProfileSnap.data();
          }
        } catch (error) {
          console.error("Error fetching supplier profile:", error);
        }

        offersData.push({
          id: docSnap.id,
          ...data,
          supplierProfile
        } as SupplierOffer);
      }
      
      // Sort by creation date (newest first)
      offersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOffers(offersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [vendorId]);

  const handleAcceptOffer = async (offer: SupplierOffer) => {
    try {
      await updateDoc(doc(db, "supplier_offers", offer.id), {
        status: 'accepted',
        updatedAt: new Date().toISOString()
      });
      
      toast({
        title: "Offer Accepted!",
        description: "The supplier has been notified of your acceptance."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept offer.",
        variant: "destructive"
      });
    }
  };

  const handleRejectOffer = async (offer: SupplierOffer) => {
    try {
      await updateDoc(doc(db, "supplier_offers", offer.id), {
        status: 'rejected',
        updatedAt: new Date().toISOString()
      });
      
      toast({
        title: "Offer Rejected",
        description: "The supplier has been notified of your decision."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject offer.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {status === 'accepted' ? 'Accepted' : 
         status === 'rejected' ? 'Rejected' : 'Pending'}
      </Badge>
    );
  };

  const pendingOffers = offers.filter(offer => offer.status === 'pending');
  const acceptedOffers = offers.filter(offer => offer.status === 'accepted');
  const rejectedOffers = offers.filter(offer => offer.status === 'rejected');

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        userRole="vendor" 
        onLogout={() => window.location.href = '/'} 
        userName={vendorProfile?.fullName}
      />
      
      <main className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Received Offers</h1>
            <p className="text-muted-foreground">Review and manage offers from suppliers</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offers.length}</div>
              <p className="text-xs text-muted-foreground">All offers received</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pendingOffers.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting decision</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{acceptedOffers.length}</div>
              <p className="text-xs text-muted-foreground">Confirmed orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{rejectedOffers.length}</div>
              <p className="text-xs text-muted-foreground">Declined offers</p>
            </CardContent>
          </Card>
        </div>

        {/* Offers List */}
        <Card>
          <CardHeader>
            <CardTitle>All Offers</CardTitle>
            <CardDescription>
              Review offers from suppliers for your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading offers...</div>
            ) : offers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No offers received yet. Suppliers will submit offers for your needs.
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => (
                  <Card key={offer.id} className="relative">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-5 h-5 text-primary" />
                              <h3 className="font-semibold">
                                {offer.supplierProfile?.companyName || 'Supplier'}
                              </h3>
                            </div>
                            {getStatusBadge(offer.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">₹{offer.totalPrice}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Truck className="w-4 h-4 text-muted-foreground" />
                              <span>{offer.deliveryMode}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{offer.deliveryTime}</span>
                            </div>
                          </div>

                          {offer.notes && (
                            <div className="mb-4 p-3 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground">{offer.notes}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center space-x-4">
                              <span>Contact: {offer.supplierProfile?.contactPersonName}</span>
                              {offer.supplierProfile?.phone && (
                                <span>Phone: {offer.supplierProfile.phone}</span>
                              )}
                            </div>
                            <span>{new Date(offer.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          {offer.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAcceptOffer(offer)}
                                className="flex items-center space-x-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Accept</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectOffer(offer)}
                                className="flex items-center space-x-1"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Reject</span>
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedOffer(offer);
                              setIsOfferDialogOpen(true);
                            }}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Offer Details Dialog */}
      <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Offer Details</DialogTitle>
          </DialogHeader>
          {selectedOffer && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-medium">Supplier</Label>
                <div className="text-sm text-muted-foreground">
                  {selectedOffer.supplierProfile?.companyName || 'Supplier'}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Contact Person</Label>
                <div className="text-sm text-muted-foreground">
                  {selectedOffer.supplierProfile?.contactPersonName}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Total Price</Label>
                <div className="text-lg font-bold">₹{selectedOffer.totalPrice}</div>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Delivery Details</Label>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedOffer.deliveryMode}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedOffer.deliveryTime}</span>
                  </div>
                </div>
              </div>

              {selectedOffer.notes && (
                <div className="space-y-2">
                  <Label className="font-medium">Notes</Label>
                  <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    {selectedOffer.notes}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="font-medium">Contact Information</Label>
                <div className="space-y-1 text-sm">
                  {selectedOffer.supplierProfile?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedOffer.supplierProfile.phone}</span>
                    </div>
                  )}
                  {selectedOffer.supplierProfile?.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedOffer.supplierProfile.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsOfferDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 