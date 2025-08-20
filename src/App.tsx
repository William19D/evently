import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VenueSearch from "./pages/VenueSearch";
import AuthSelection from "./pages/AuthSelection";
import RegisterSelection from "./pages/RegisterSelection";
import ClientLogin from "./pages/ClientLogin";
import OwnerLogin from "./pages/OwnerLogin";
import ClientRegister from "./pages/ClientRegister";
import OwnerRegister from "./pages/OwnerRegister";
import EventDetails from "./pages/EventDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
          {/* Legacy routes for backwards compatibility */}
          <Route path="/login" element={<AuthSelection />} />
          <Route path="/register" element={<RegisterSelection />} />
          <Route path="/event/:id" element={<EventDetails />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
