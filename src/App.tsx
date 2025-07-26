import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorNeeds from "./pages/vendor/VendorNeeds";
import VendorOffers from "./pages/vendor/VendorOffers";
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import NotFound from "./pages/NotFound";
import VendorDetailsForm from "./pages/vendor/VendorDetailsForm";
import SupplierDetailsForm from "./pages/supplier/SupplierDetailsForm";
import InventoryManagement from "./pages/supplier/InventoryManagement";
import SubmitOffers from "./pages/supplier/SubmitOffers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/needs" element={<VendorNeeds />} />
          <Route path="/vendor/offers" element={<VendorOffers />} />
          <Route path="/vendor/details" element={<VendorDetailsForm />} />
          <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
          <Route path="/supplier/details" element={<SupplierDetailsForm />} />
          <Route path="/supplier/inventory" element={<InventoryManagement />} />
          <Route path="/supplier/offers" element={<SubmitOffers />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
