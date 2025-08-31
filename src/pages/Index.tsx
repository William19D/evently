import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedSpaces from "@/components/FeaturedSpaces";
import Categories from "@/components/Categories";
import Footer from "@/components/Footer";
import MfaPrompt from "@/components/MfaPrompt";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [showMfaPrompt, setShowMfaPrompt] = useState(false);
  const { user, isMfaEnabled, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we should show MFA prompt for new users
    if (!isLoading && user && !isMfaEnabled) {
      // Check if this is a new user (created within last 24 hours)
      const isNewUser = user.created_at && 
        (Date.now() - new Date(user.created_at).getTime()) < 24 * 60 * 60 * 1000;
      
      // Check if user has already dismissed the prompt (stored in localStorage)
      const hasShownPrompt = localStorage.getItem(`mfa-prompt-shown-${user.id}`);
      
      if (isNewUser && !hasShownPrompt) {
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
