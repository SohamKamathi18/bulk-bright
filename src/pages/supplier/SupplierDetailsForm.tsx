import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Building2, User, Phone, Mail, Package, MapPin, Truck, DollarSign } from "lucide-react";

const businessTypes = [
  "Wholesaler", "Farmer", "Distributor", "Manufacturer", "Importer", "Other"
];

const productCategories = [
  "Vegetables", "Fruits", "Spices", "Grains", "Dairy", "Meat", "Beverages", "Snacks", "Bakery", "Frozen Foods"
];

const deliveryModes = [
  "Door Delivery", "Bulk Pickup", "Warehouse Pickup", "Express Delivery", "Scheduled Delivery"
];

export default function SupplierDetailsForm() {
  const [form, setForm] = useState({
    companyName: "",
    contactPersonName: "",
    phone: "",
    email: "",
    businessType: "",
    productCategories: [] as string[],
    serviceAreaPin: "",
    deliveryModes: [] as string[],
    pricingPreference: "fixed" // "fixed" or "dynamic"
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter((v) => v !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.contactPersonName || !form.phone || !form.businessType || !form.serviceAreaPin) {
      toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    if (form.productCategories.length === 0) {
      toast({ title: "Missing Fields", description: "Please select at least one product category.", variant: "destructive" });
      return;
    }
    if (form.deliveryModes.length === 0) {
      toast({ title: "Missing Fields", description: "Please select at least one delivery mode.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
      
      await setDoc(doc(db, "supplier_profiles", user.uid), {
        ...form,
        uid: user.uid,
        createdAt: new Date().toISOString()
      });
      
      toast({ title: "Profile Saved!", description: "Your supplier details have been saved." });
      navigate("/supplier/dashboard");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save details.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Building2 className="w-6 h-6 text-primary" />
              <span>Supplier Profile</span>
            </CardTitle>
            <CardDescription>Complete your business details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="companyName" 
                    value={form.companyName} 
                    onChange={e => handleChange("companyName", e.target.value)} 
                    className="pl-10" 
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
                    value={form.contactPersonName} 
                    onChange={e => handleChange("contactPersonName", e.target.value)} 
                    className="pl-10" 
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
                    value={form.phone} 
                    onChange={e => handleChange("phone", e.target.value)} 
                    className="pl-10" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    value={form.email} 
                    onChange={e => handleChange("email", e.target.value)} 
                    className="pl-10" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type *</Label>
                <Select value={form.businessType} onValueChange={v => handleChange("businessType", v)}>
                  <SelectTrigger className="pl-10">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
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
                      variant={form.productCategories.includes(item) ? "default" : "outline"}
                      className="flex items-center space-x-1"
                      onClick={() => handleMultiSelect("productCategories", item)}
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
                    value={form.serviceAreaPin} 
                    onChange={e => handleChange("serviceAreaPin", e.target.value)} 
                    className="pl-10" 
                    placeholder="Enter PIN code"
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
                      variant={form.deliveryModes.includes(item) ? "default" : "outline"}
                      className="flex items-center space-x-1"
                      onClick={() => handleMultiSelect("deliveryModes", item)}
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
                      checked={form.pricingPreference === "dynamic"}
                      onCheckedChange={(checked) => 
                        handleChange("pricingPreference", checked ? "dynamic" : "fixed")
                      }
                    />
                    <Label htmlFor="pricing-preference">
                      {form.pricingPreference === "dynamic" ? "Dynamic Bidding" : "Fixed Price"}
                    </Label>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {form.pricingPreference === "dynamic" 
                    ? "Prices change based on demand and supply" 
                    : "Fixed prices for consistent pricing"
                  }
                </p>
              </div>

              <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save & Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 