import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  User, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Truck, 
  Package, 
  DollarSign, 
  Edit3, 
  Save, 
  X,
  Store,
  Languages
} from "lucide-react";

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'vendor' | 'supplier';
}

// Vendor form fields
const businessTypes = [
  "Tea stall", "Fruit cart", "Snack vendor", "Vegetable seller", "Grocery", "Other"
];

const deliveryOptions = [
  { value: "home", label: "Home Delivery" },
  { value: "pickup", label: "Pickup Point" },
  { value: "either", label: "Either" }
];

const rawNeeds = [
  "Tomatoes", "Onions", "Oil", "Potatoes", "Milk", "Bread", "Eggs", "Sugar", "Salt", "Rice"
];

const languages = [
  { value: "hindi", label: "Hindi" },
  { value: "english", label: "English" },
  { value: "marathi", label: "Marathi" },
  { value: "other", label: "Other" }
];

// Supplier form fields
const supplierBusinessTypes = [
  "Wholesaler", "Farmer", "Distributor", "Manufacturer", "Importer", "Other"
];

const productCategories = [
  "Vegetables", "Fruits", "Spices", "Grains", "Dairy", "Meat", "Beverages", "Snacks", "Bakery", "Frozen Foods"
];

const deliveryModes = [
  "Door Delivery", "Bulk Pickup", "Warehouse Pickup", "Express Delivery", "Scheduled Delivery"
];

export default function ProfilePopup({ isOpen, onClose, userRole }: ProfilePopupProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  // Vendor form state
  const [vendorForm, setVendorForm] = useState({
    fullName: "",
    businessType: "",
    businessName: "",
    phone: "",
    email: "",
    pinCode: "",
    preferredDelivery: "",
    avgDailyNeeds: [] as string[],
    language: ""
  });

  // Supplier form state
  const [supplierForm, setSupplierForm] = useState({
    companyName: "",
    contactPersonName: "",
    phone: "",
    email: "",
    businessType: "",
    productCategories: [] as string[],
    serviceAreaPin: "",
    deliveryModes: [] as string[],
    pricingPreference: "fixed"
  });

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen, userRole]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.photoURL) {
        setUserPhotoURL(user.photoURL);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const collectionName = userRole === 'vendor' ? 'vendor_profiles' : 'supplier_profiles';
    const profileRef = doc(db, collectionName, user.uid);
    
    try {
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        setProfile(data);
        
        if (userRole === 'vendor') {
          setVendorForm({
            fullName: data.fullName || "",
            businessType: data.businessType || "",
            businessName: data.businessName || "",
            phone: data.phone || "",
            email: data.email || "",
            pinCode: data.pinCode || "",
            preferredDelivery: data.preferredDelivery || "",
            avgDailyNeeds: data.avgDailyNeeds || [],
            language: data.language || ""
          });
        } else {
          setSupplierForm({
            companyName: data.companyName || "",
            contactPersonName: data.contactPersonName || "",
            phone: data.phone || "",
            email: data.email || "",
            businessType: data.businessType || "",
            productCategories: data.productCategories || [],
            serviceAreaPin: data.serviceAreaPin || "",
            deliveryModes: data.deliveryModes || [],
            pricingPreference: data.pricingPreference || "fixed"
          });
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleVendorChange = (field: string, value: any) => {
    setVendorForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSupplierChange = (field: string, value: any) => {
    setSupplierForm(prev => ({ ...prev, [field]: value }));
  };

  const handleVendorMultiSelect = (value: string) => {
    setVendorForm(prev => ({
      ...prev,
      avgDailyNeeds: prev.avgDailyNeeds.includes(value)
        ? prev.avgDailyNeeds.filter(v => v !== value)
        : [...prev.avgDailyNeeds, value]
    }));
  };

  const handleSupplierMultiSelect = (field: string, value: string) => {
    setSupplierForm(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter(v => v !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }));
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsLoading(true);
    try {
      const collectionName = userRole === 'vendor' ? 'vendor_profiles' : 'supplier_profiles';
      const profileRef = doc(db, collectionName, user.uid);
      
      const updateData = userRole === 'vendor' ? vendorForm : supplierForm;
      await updateDoc(profileRef, updateData);
      
      toast({
        title: "Profile Updated!",
        description: "Your profile has been successfully updated.",
      });
      
      setIsEditing(false);
      fetchProfile(); // Refresh the profile data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderVendorForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="fullName"
            value={vendorForm.fullName}
            onChange={e => handleVendorChange("fullName", e.target.value)}
            className="pl-10"
            disabled={!isEditing}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessType">Business Type *</Label>
        <Select value={vendorForm.businessType} onValueChange={v => handleVendorChange("businessType", v)} disabled={!isEditing}>
          <SelectTrigger className="pl-10">
            <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessName">Business Name</Label>
        <div className="relative">
          <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="businessName"
            value={vendorForm.businessName}
            onChange={e => handleVendorChange("businessName", e.target.value)}
            className="pl-10"
            disabled={!isEditing}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            value={vendorForm.phone}
            onChange={e => handleVendorChange("phone", e.target.value)}
            className="pl-10"
            disabled={!isEditing}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={vendorForm.email}
            onChange={e => handleVendorChange("email", e.target.value)}
            className="pl-10"
            disabled={!isEditing}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pinCode">Location (PIN Code) *</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="pinCode"
            value={vendorForm.pinCode}
            onChange={e => handleVendorChange("pinCode", e.target.value)}
            className="pl-10"
            disabled={!isEditing}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredDelivery">Preferred Delivery *</Label>
        <Select value={vendorForm.preferredDelivery} onValueChange={v => handleVendorChange("preferredDelivery", v)} disabled={!isEditing}>
          <SelectTrigger className="pl-10">
            <Truck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select delivery option" />
          </SelectTrigger>
          <SelectContent>
            {deliveryOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Avg Daily Raw Needs</Label>
        <div className="flex flex-wrap gap-2">
          {rawNeeds.map(item => (
            <Button
              key={item}
              type="button"
              variant={vendorForm.avgDailyNeeds.includes(item) ? "default" : "outline"}
              className="flex items-center space-x-1"
              onClick={() => handleVendorMultiSelect(item)}
              disabled={!isEditing}
            >
              <Package className="w-4 h-4 mr-1" />
              {item}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="language">Language Preference *</Label>
        <Select value={vendorForm.language} onValueChange={v => handleVendorChange("language", v)} disabled={!isEditing}>
          <SelectTrigger className="pl-10">
            <Languages className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map(lang => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderSupplierForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name *</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="companyName"
            value={supplierForm.companyName}
            onChange={e => handleSupplierChange("companyName", e.target.value)}
            className="pl-10"
            disabled={!isEditing}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPersonName">Contact Person Name *</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="contactPersonName"
            value={supplierForm.contactPersonName}
            onChange={e => handleSupplierChange("contactPersonName", e.target.value)}
            className="pl-10"
            disabled={!isEditing}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            value={supplierForm.phone}
            onChange={e => handleSupplierChange("phone", e.target.value)}
            className="pl-10"
            disabled={!isEditing}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={supplierForm.email}
            onChange={e => handleSupplierChange("email", e.target.value)}
            className="pl-10"
            disabled={!isEditing}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessType">Business Type *</Label>
        <Select value={supplierForm.businessType} onValueChange={v => handleSupplierChange("businessType", v)} disabled={!isEditing}>
          <SelectTrigger className="pl-10">
            <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            {supplierBusinessTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Product Categories *</Label>
        <div className="flex flex-wrap gap-2">
          {productCategories.map(item => (
            <Button
              key={item}
              type="button"
              variant={supplierForm.productCategories.includes(item) ? "default" : "outline"}
              className="flex items-center space-x-1"
              onClick={() => handleSupplierMultiSelect("productCategories", item)}
              disabled={!isEditing}
            >
              <Package className="w-4 h-4 mr-1" />
              {item}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="serviceAreaPin">Service Area (PIN Code) *</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="serviceAreaPin"
            value={supplierForm.serviceAreaPin}
            onChange={e => handleSupplierChange("serviceAreaPin", e.target.value)}
            className="pl-10"
            disabled={!isEditing}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Delivery Modes *</Label>
        <div className="flex flex-wrap gap-2">
          {deliveryModes.map(item => (
            <Button
              key={item}
              type="button"
              variant={supplierForm.deliveryModes.includes(item) ? "default" : "outline"}
              className="flex items-center space-x-1"
              onClick={() => handleSupplierMultiSelect("deliveryModes", item)}
              disabled={!isEditing}
            >
              <Truck className="w-4 h-4 mr-1" />
              {item}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4" />
          <span>Pricing Preference</span>
        </Label>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="pricing-preference"
              checked={supplierForm.pricingPreference === "dynamic"}
              onCheckedChange={(checked) => 
                handleSupplierChange("pricingPreference", checked ? "dynamic" : "fixed")
              }
              disabled={!isEditing}
            />
            <Label htmlFor="pricing-preference">
              {supplierForm.pricingPreference === "dynamic" ? "Dynamic Bidding" : "Fixed Price"}
            </Label>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {supplierForm.pricingPreference === "dynamic" 
            ? "Prices change based on demand and supply" 
            : "Fixed prices for consistent pricing"
          }
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={userPhotoURL || undefined} alt="Profile" />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <span>{userRole === 'vendor' ? 'Vendor' : 'Supplier'} Profile</span>
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center space-x-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isLoading ? "Saving..." : "Save"}</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <Card>
          <CardContent className="pt-6">
            {userRole === 'vendor' ? renderVendorForm() : renderSupplierForm()}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
} 