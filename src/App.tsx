import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { AuthProvider } from "@/contexts/AuthContext";
import AccessibilityPanel from "@/components/AccessibilityPanel";
import Index from "./pages/Index";
import VenueSearch from "./pages/VenueSearch";
import AuthSelection from "./pages/AuthSelection";
import RegisterSelection from "./pages/RegisterSelection";
import ClientLogin from "./pages/ClientLogin";
import OwnerLogin from "./pages/OwnerLogin";
import ClientRegister from "./pages/ClientRegister";
import OwnerRegister from "./pages/OwnerRegister";
import EmailConfirmation from '@/pages/EmailConfirmation';

import EventDetails from "./pages/EventDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import PublishSpace from "./pages/PublishSpace";
import OwnerDashboard from "./pages/OwnerDashboard";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import MfaSetup from "./pages/MfaSetup";
import UserProfile from "./pages/UserProfile";
import MfaDebug from "./components/MfaDebug";
import NotFound from "./pages/NotFound";
import SuperadminLogin from "./pages/SuperadminLogin";
import SuperadminDashboard from "./pages/SuperadminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AccessibilityProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<VenueSearch />} />
              <Route path="/login-selection" element={<AuthSelection />} />
              <Route path="/register-selection" element={<RegisterSelection />} />
              <Route path="/login/client" element={<ClientLogin />} />
              <Route path="/login/owner" element={<OwnerLogin />} />
              <Route path="/register/client" element={<ClientRegister />} />
              <Route path="/register/owner" element={<OwnerRegister />} />
              <Route path="/email-confirmation" element={<EmailConfirmation />} />
              
              {/* Legacy routes for backwards compatibility */}
              <Route path="/login" element={<AuthSelection />} />
              <Route path="/register" element={<RegisterSelection />} />
              <Route path="/event/:id" element={<EventDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/publish-space" element={<PublishSpace />} />
              <Route path="/dashboard" element={<OwnerDashboard />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/two-factor-auth" element={<TwoFactorAuth />} />
              <Route path="/mfa-setup" element={<MfaSetup />} />
              {/* Legacy 2FA route for backwards compatibility */}
              <Route path="/2fa" element={<TwoFactorAuth />} />
              {/* Superadmin routes - hidden URLs */}
              <Route path="/superadmin/login" element={<SuperadminLogin />} />
              <Route path="/superadmin/dashboard" element={<SuperadminDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AccessibilityPanel />
            {/* <MfaDebug /> */}
          </BrowserRouter>
        </AccessibilityProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
