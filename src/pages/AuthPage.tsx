import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Users, Phone, ArrowLeft } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'vendor' | 'supplier'>(
    (searchParams.get('role') as 'vendor' | 'supplier') || 'vendor'
  );

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      toast({
        title: "Welcome to VendorLink!",
        description: `Logged in successfully as ${selectedRole}`,
      });
      // Navigate to appropriate dashboard directly
      if (selectedRole === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/supplier/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Welcome to VendorLink!",
        description: `Logged in successfully as ${selectedRole}`,
      });

      // Navigate to appropriate dashboard
      if (selectedRole === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/supplier/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setPhone("");
    setOtp("");
    setOtpSent(false);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">VendorLink</span>
          </div>
          <p className="text-muted-foreground">Enter your phone number to get started</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'vendor' | 'supplier')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="vendor" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Vendor</span>
                </TabsTrigger>
                <TabsTrigger value="supplier" className="flex items-center space-x-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Supplier</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="vendor" className="mt-4">
                <CardTitle>Join as Street Vendor</CardTitle>
                <CardDescription>
                  Source raw materials at better prices through collective buying
                </CardDescription>
              </TabsContent>

              <TabsContent value="supplier" className="mt-4">
                <CardTitle>Join as Supplier</CardTitle>
                <CardDescription>
                  Connect with vendor clusters and grow your business
                </CardDescription>
              </TabsContent>
            </Tabs>
          </CardHeader>

          <CardContent className="space-y-4">
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    maxLength={10}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSendOTP} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </>
            <div className="text-center text-sm text-muted-foreground">
              By continuing, you agree to our Terms & Privacy Policy
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}