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
import AuthCallback from '@/pages/AuthCallback';
import RecoverPassword from "./pages/RecoverPassword";
import ResetPassword from "./pages/ResetPassword";

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
import MfaVerification from "./pages/MfaVerification";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import SuperadminLogin from "./pages/SuperadminLogin";
import SuperadminDashboard from "./pages/SuperadminDashboard";
import PublicSpaces from "./pages/PublicSpaces";
import PublicSpaceDetail from "./pages/PublicSpaceDetail";
import EmailVerificationHandler from "./components/EmailVerificationHandler";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AccessibilityProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <EmailVerificationHandler />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<VenueSearch />} />
              <Route path="/login-selection" element={<AuthSelection />} />
              <Route path="/register-selection" element={<RegisterSelection />} />
              <Route path="/login/client" element={<ClientLogin />} />
              <Route path="/login/owner" element={<OwnerLogin />} />
              <Route path="/register/client" element={<ClientRegister />} />
              <Route path="/register/owner" element={<OwnerRegister />} />
              <Route path="/RecoverPassword" element={<RecoverPassword />} />
              <Route path="/recover-password" element={<RecoverPassword />} />
              <Route path="/forgot-password" element={<RecoverPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/email-confirmation" element={<EmailConfirmation />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/mfa-verification" element={<MfaVerification />} />
              
              {/* Legacy routes for backwards compatibility */}
              <Route path="/login" element={<AuthSelection />} />
              <Route path="/register" element={<RegisterSelection />} />
              <Route path="/event/:id" element={<EventDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              
              {/* Public spaces routes - no authentication required */}
              <Route path="/spaces" element={<PublicSpaces />} />
              <Route path="/spaces/:id" element={<PublicSpaceDetail />} />
              
              <Route path="/publish-space" element={
                <ProtectedRoute>
                  <PublishSpace />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <OwnerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } />
              <Route path="/two-factor-auth" element={
                <ProtectedRoute>
                  <TwoFactorAuth />
                </ProtectedRoute>
              } />
              <Route path="/mfa-setup" element={
                <ProtectedRoute>
                  <MfaSetup />
                </ProtectedRoute>
              } />
              {/* Legacy 2FA route for backwards compatibility */}
              <Route path="/2fa" element={
                <ProtectedRoute>
                  <TwoFactorAuth />
                </ProtectedRoute>
              } />
              {/* Superadmin routes - hidden URLs */}
              <Route path="/superadmin/login" element={<SuperadminLogin />} />
              <Route path="/superadmin/dashboard" element={
                <ProtectedRoute>
                  <SuperadminDashboard />
                </ProtectedRoute>
              } />
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
