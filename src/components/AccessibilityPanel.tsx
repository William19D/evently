import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { 
  Accessibility, 
  Type, 
  Volume2, 
  VolumeX, 
  Minus, 
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Contrast,
  Palette
} from 'lucide-react';

const AccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    fontScale, 
    setFontScale, 
    highContrast,
    setHighContrast,
    textToSpeechEnabled, 
    setTextToSpeechEnabled,
    stopSpeaking 
  } = useAccessibility();

  const handleFontScaleChange = (value: number[]) => {
    setFontScale(value[0]);
  };

  const increaseFontSize = () => {
    const newScale = Math.min(fontScale + 25, 200);
    setFontScale(newScale);
  };

  const decreaseFontSize = () => {
    const newScale = Math.max(fontScale - 25, 75);
    setFontScale(newScale);
  };

  const handleTextToSpeechToggle = (enabled: boolean) => {
    if (!enabled) {
      stopSpeaking();
    }
    setTextToSpeechEnabled(enabled);
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 max-h-screen">
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? 'rounded-r-none' : 'rounded-l-none'
        } bg-background shadow-lg border-l-0 h-12`}
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
        } absolute right-0 top-0 max-h-screen overflow-y-auto`}
      >
        <Card className="w-80 shadow-xl border-l-0 rounded-l-lg rounded-r-none">
          <CardHeader className="pb-3 flex flex-row items-center justify-between sticky top-0 bg-card z-10 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Accessibility className="w-5 h-5" />
              Accesibilidad
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
              aria-label="Cerrar panel"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6 pb-8">
            {/* Font Size Controls */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                <Label className="font-medium">Tamaño de texto</Label>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Pequeño</span>
                  <span className="font-medium">{fontScale}%</span>
                  <span>Grande</span>
                </div>
                
                <Slider
                  value={[fontScale]}
                  onValueChange={handleFontScaleChange}
                  min={75}
                  max={200}
                  step={25}
                  className="w-full"
                />
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decreaseFontSize}
                    className="flex-1"
                    disabled={fontScale <= 75}
                  >
                    <Minus className="w-3 h-3 mr-1" />
                    -25%
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFontScale(100)}
                    className="flex-1"
                  >
                    Normal
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={increaseFontSize}
                    className="flex-1"
                    disabled={fontScale >= 200}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    +25%
                  </Button>
                </div>
              </div>
            </div>

            {/* High Contrast Toggle */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Contrast className="w-4 h-4" />
                <Label className="font-medium">Alto contraste</Label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Mejora la legibilidad con colores de alto contraste
                  </p>
                </div>
                <Switch
                  checked={highContrast}
                  onCheckedChange={setHighContrast}
                  aria-label="Activar alto contraste"
                />
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
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Instrucciones de uso:</strong><br />
                • <strong>Tamaño:</strong> Usa el deslizador o botones (+25%/-25%) para ajustar el texto<br />
                • <strong>Contraste:</strong> Activa para mejorar la visibilidad de colores<br />
                • <strong>Lectura:</strong> Pasa el mouse sobre cualquier texto para escucharlo<br />
                • <strong>Aplicación:</strong> Los cambios se ven inmediatamente en toda la página
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessibilityPanel;