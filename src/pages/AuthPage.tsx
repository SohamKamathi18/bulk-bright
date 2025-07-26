import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Users, Mail, Lock, ArrowLeft } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'vendor' | 'supplier'>(
    (searchParams.get('role') as 'vendor' | 'supplier') || 'vendor'
  );

  const handleAuth = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "Account Created!",
          description: "You have successfully registered.",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Welcome to VendorLink!",
          description: `Logged in successfully as ${selectedRole}`,
        });
      }
      if (selectedRole === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/supplier/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || (isRegister ? "Registration failed." : "Login failed."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
          <p className="text-muted-foreground">Enter your email and password to get started</p>
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
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button 
              onClick={handleAuth} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (isRegister ? "Registering..." : "Logging in...") : (isRegister ? "Register" : "Login")}
            </Button>
            <div className="text-center text-sm">
              {isRegister ? (
                <>
                  Already have an account?{' '}
                  <button className="underline text-primary" onClick={() => setIsRegister(false)} type="button">Login</button>
                </>
              ) : (
                <>
                  New here?{' '}
                  <button className="underline text-primary" onClick={() => setIsRegister(true)} type="button">Register</button>
                </>
              )}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              By continuing, you agree to our Terms & Privacy Policy
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}