import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  fontScale: number;
  setFontScale: (scale: number) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  textToSpeechEnabled: boolean;
  setTextToSpeechEnabled: (enabled: boolean) => void;
  keyboardNavigation: boolean;
  setKeyboardNavigation: (enabled: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (enabled: boolean) => void;
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
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

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
    const body = document.body;
    
    if (highContrast) {
      root.classList.add('high-contrast');
      body.classList.add('high-contrast');
      
      // Create a MutationObserver to handle dynamically added elements
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Apply high contrast classes to new elements
              if (element.classList) {
                if (element.classList.contains('bg-primary')) {
                  element.classList.add('high-contrast-primary');
                }
                if (element.classList.contains('bg-secondary')) {
                  element.classList.add('high-contrast-secondary');
                }
                
                // Also check child elements
                const children = element.querySelectorAll('.bg-primary, .bg-secondary');
                children.forEach(child => {
                  if (child.classList.contains('bg-primary')) {
                    child.classList.add('high-contrast-primary');
                  }
                  if (child.classList.contains('bg-secondary')) {
                    child.classList.add('high-contrast-secondary');
                  }
                });
              }
            }
          });
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Store observer to clean it up later
      (window as any).accessibilityObserver = observer;
      
      // Apply to existing elements
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        if (element.classList.contains('bg-primary')) {
          element.classList.add('high-contrast-primary');
        }
        if (element.classList.contains('bg-secondary')) {
          element.classList.add('high-contrast-secondary');
        }
      });
    } else {
      root.classList.remove('high-contrast');
      body.classList.remove('high-contrast');
      
      // Clean up observer
      if ((window as any).accessibilityObserver) {
        (window as any).accessibilityObserver.disconnect();
        delete (window as any).accessibilityObserver;
      }
      
      // Remove from all elements
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        element.classList.remove('high-contrast-primary', 'high-contrast-secondary');
      });
    }

    // Cleanup function
    return () => {
      if ((window as any).accessibilityObserver) {
        (window as any).accessibilityObserver.disconnect();
        delete (window as any).accessibilityObserver;
      }
    };
  }, [highContrast]);

  // Apply keyboard navigation focus indicators
  useEffect(() => {
    const root = document.documentElement;
    if (keyboardNavigation) {
      root.classList.add('keyboard-navigation');
      
      // Add keyboard navigation handlers
      const handleKeyDown = (e: KeyboardEvent) => {
        const focusableElements = Array.from(
          document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"]'
          )
        ).filter((el) => {
          const element = el as HTMLElement;
          return !(element as any).disabled && 
                 element.tabIndex !== -1 && 
                 element.offsetParent !== null;
        }) as HTMLElement[];

        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
        
        switch (e.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % focusableElements.length;
            focusableElements[nextIndex]?.focus();
            break;
          case 'ArrowUp':
          case 'ArrowLeft':
            e.preventDefault();
            const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
            focusableElements[prevIndex]?.focus();
            break;
          case 'Home':
            e.preventDefault();
            focusableElements[0]?.focus();
            break;
          case 'End':
            e.preventDefault();
            focusableElements[focusableElements.length - 1]?.focus();
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      root.classList.remove('keyboard-navigation');
    }
  }, [keyboardNavigation]);

  // Apply reduced motion preferences
  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [reduceMotion]);

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
    keyboardNavigation,
    setKeyboardNavigation,
    reduceMotion,
    setReduceMotion,
    speakText,
    stopSpeaking,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};