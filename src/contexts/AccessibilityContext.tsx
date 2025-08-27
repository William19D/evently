import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  fontScale: number;
  setFontScale: (scale: number) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  textToSpeechEnabled: boolean;
  setTextToSpeechEnabled: (enabled: boolean) => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontScale, setFontScale] = useState<number>(100);
  const [highContrast, setHighContrast] = useState(false);
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(false);

  const speakText = (text: string) => {
    if (!textToSpeechEnabled || !('speechSynthesis' in window)) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    // Clean text (remove extra spaces, line breaks, etc.)
    const cleanText = text.trim().replace(/\s+/g, ' ');
    
    if (cleanText.length === 0) return;
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Apply font scale to root element
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${fontScale}%`;
  }, [fontScale]);

  // Apply high contrast mode
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Add hover listeners for text-to-speech
  useEffect(() => {
    if (!textToSpeechEnabled) return;

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target) {
        const text = target.innerText || target.textContent;
        if (text && text.trim().length > 0) {
          speakText(text.trim());
        }
      }
    };

    const handleMouseLeave = () => {
      stopSpeaking();
    };

    // Add listeners to text elements
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div[class*="text"], button, a, label');
    
    textElements.forEach((element) => {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      textElements.forEach((element) => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [textToSpeechEnabled]);

  const value = {
    fontScale,
    setFontScale,
    highContrast,
    setHighContrast,
    textToSpeechEnabled,
    setTextToSpeechEnabled,
    speakText,
    stopSpeaking,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};