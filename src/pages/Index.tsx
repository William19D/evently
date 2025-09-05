import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedSpaces from "@/components/FeaturedSpaces";
import Categories from "@/components/Categories";
import Footer from "@/components/Footer";
import MfaPrompt from "@/components/MfaPrompt";
import MfaBanner from "@/components/MfaBanner";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [showMfaPrompt, setShowMfaPrompt] = useState(false);
  const { user, isMfaEnabled, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we should show MFA prompt for users without MFA
    if (!isLoading && user && !isMfaEnabled) {
      // Check if user has already dismissed the prompt (stored in localStorage)
      const hasShownPrompt = localStorage.getItem(`mfa-prompt-shown-${user.id}`);
      
      if (!hasShownPrompt) {
        setShowMfaPrompt(true);
      }
    }
  }, [user, isMfaEnabled, isLoading]);

  const handleMfaPromptDismiss = () => {
    setShowMfaPrompt(false);
    if (user) {
      localStorage.setItem(`mfa-prompt-shown-${user.id}`, 'true');
    }
  };

  const handleMfaSetup = () => {
    setShowMfaPrompt(false);
    navigate('/mfa-setup');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* MFA Banner para usuarios autenticados sin MFA */}
      {user && (
        <div className="container mx-auto px-4 pt-4">
          <MfaBanner />
        </div>
      )}
      
      <Hero />
      <FeaturedSpaces />
      <Categories />
      <Footer />
      
      {showMfaPrompt && (
        <MfaPrompt 
          onDismiss={handleMfaPromptDismiss}
          onSetup={handleMfaSetup}
        />
      )}
    </div>
  );
};

export default Index;
