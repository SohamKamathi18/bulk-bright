import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { User, Store, Phone, Mail, MapPin, Truck, ShoppingCart, Languages } from "lucide-react";

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

export default function VendorDetailsForm() {
  const [form, setForm] = useState({
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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (value: string) => {
    setForm((prev) => ({
      ...prev,
      avgDailyNeeds: prev.avgDailyNeeds.includes(value)
        ? prev.avgDailyNeeds.filter((v) => v !== value)
        : [...prev.avgDailyNeeds, value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.businessType || !form.phone || !form.pinCode || !form.preferredDelivery || !form.language) {
      toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
      await setDoc(doc(db, "vendor_profiles", user.uid), {
        ...form,
        uid: user.uid,
        createdAt: new Date().toISOString()
      });
      toast({ title: "Profile Saved!", description: "Your details have been saved." });
      navigate("/vendor/dashboard");
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
              <User className="w-6 h-6 text-primary" />
              <span>Vendor Profile</span>
            </CardTitle>
            <CardDescription>Complete your details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="fullName" value={form.fullName} onChange={e => handleChange("fullName", e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type *</Label>
                <Select value={form.businessType} onValueChange={v => handleChange("businessType", v)}>
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
                <Label htmlFor="businessName">Business Name (optional)</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="businessName" value={form.businessName} onChange={e => handleChange("businessName", e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" type="tel" value={form.phone} onChange={e => handleChange("phone", e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" value={form.email} onChange={e => handleChange("email", e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pinCode">Location (PIN Code) *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="pinCode" value={form.pinCode} onChange={e => handleChange("pinCode", e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredDelivery">Preferred Delivery *</Label>
                <Select value={form.preferredDelivery} onValueChange={v => handleChange("preferredDelivery", v)}>
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
                      variant={form.avgDailyNeeds.includes(item) ? "default" : "outline"}
                      className="flex items-center space-x-1"
                      onClick={() => handleMultiSelect(item)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      {item}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language Preference *</Label>
                <Select value={form.language} onValueChange={v => handleChange("language", v)}>
                  <SelectTrigger className="pl-10">
                    <Languages className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                  </SelectContent>
                </Select>
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