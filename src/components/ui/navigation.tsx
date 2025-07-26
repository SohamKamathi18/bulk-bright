import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart, Users, BarChart3, LogOut, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import ProfilePopup from "@/components/ProfilePopup";

interface NavigationProps {
  userRole?: 'vendor' | 'supplier' | 'admin';
  onLogout?: () => void;
  userName?: string;
}

export function Navigation({ userRole, onLogout, userName }: NavigationProps) {
  const location = useLocation();
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.photoURL) {
        setUserPhotoURL(user.photoURL);
      } else {
        setUserPhotoURL(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const getNavItems = () => {
    switch (userRole) {
      case 'vendor':
        return [
          { path: '/vendor/dashboard', label: 'Dashboard', icon: BarChart3 },
          { path: '/vendor/needs', label: 'Daily Needs', icon: ShoppingCart },
          { path: '/vendor/orders', label: 'Orders', icon: Users },
        ];
      case 'supplier':
        return [
          { path: '/supplier/dashboard', label: 'Dashboard', icon: BarChart3 },
          { path: '/supplier/inventory', label: 'Inventory', icon: ShoppingCart },
          { path: '/supplier/orders', label: 'Orders', icon: Users },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">VendorLink</span>
        </Link>

        {navItems.length > 0 && (
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button 
                    variant={isActive ? "default" : "ghost"} 
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex items-center space-x-2">
          {userName && (
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2"
              onClick={() => setIsProfileOpen(true)}
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={userPhotoURL || undefined} alt={userName} />
                <AvatarFallback>
                  <User className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{userName}</span>
            </Button>
          )}
          {onLogout && (
            <Button variant="outline" onClick={onLogout} className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}
        </div>
      </div>
      
      {userRole && (
        <ProfilePopup
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          userRole={userRole}
        />
      )}
    </nav>
  );
}