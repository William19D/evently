import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { 
  Accessibility, 
  Type, 
  Volume2, 
  VolumeX, 
  Minus, 
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    fontSize, 
    setFontSize, 
    textToSpeechEnabled, 
    setTextToSpeechEnabled,
    stopSpeaking 
  } = useAccessibility();

  const handleFontSizeChange = (newSize: 'small' | 'medium' | 'large') => {
    setFontSize(newSize);
  };

  const handleTextToSpeechToggle = (enabled: boolean) => {
    if (!enabled) {
      stopSpeaking();
    }
    setTextToSpeechEnabled(enabled);
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? 'rounded-r-none' : 'rounded-l-none'
        } bg-background shadow-lg border-l-0`}
        aria-label="Abrir panel de accesibilidad"
      >
        {isOpen ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <>
            <Accessibility className="w-4 h-4 mr-1" />
            <ChevronLeft className="w-4 h-4" />
          </>
        )}
      </Button>

      {/* Panel */}
      <div
        className={`transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } absolute right-0 top-0`}
      >
        <Card className="w-80 shadow-xl border-l-0 rounded-l-lg rounded-r-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Accessibility className="w-5 h-5" />
              Accesibilidad
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Font Size Controls */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                <Label className="font-medium">Tamaño de texto</Label>
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant={fontSize === 'small' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFontSizeChange('small')}
                  className="flex-1"
                >
                  <Minus className="w-3 h-3 mr-1" />
                  Pequeño
                </Button>
                
                <Button
                  variant={fontSize === 'medium' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFontSizeChange('medium')}
                  className="flex-1"
                >
                  Normal
                </Button>
                
                <Button
                  variant={fontSize === 'large' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFontSizeChange('large')}
                  className="flex-1"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Grande
                </Button>
              </div>
            </div>

            {/* Text to Speech Toggle */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {textToSpeechEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                <Label className="font-medium">Lectura de texto</Label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Activar para escuchar el texto al pasar el mouse
                  </p>
                </div>
                <Switch
                  checked={textToSpeechEnabled}
                  onCheckedChange={handleTextToSpeechToggle}
                  aria-label="Activar lectura de texto"
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Instrucciones:</strong><br />
                • Ajusta el tamaño de texto según tus necesidades<br />
                • Activa la lectura para escuchar el texto al pasar el mouse<br />
                • Los cambios se aplican inmediatamente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessibilityPanel;