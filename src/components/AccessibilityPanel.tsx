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
  Palette,
  Keyboard,
  Zap
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
    keyboardNavigation,
    setKeyboardNavigation,
    reduceMotion,
    setReduceMotion,
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
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 accessibility-panel max-h-[calc(100vh-40px)] h-auto">
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? 'rounded-r-none' : 'rounded-l-none'
        } bg-background shadow-lg border-l-0 h-12 w-12 md:w-auto`}
        aria-label="Abrir panel de accesibilidad"
      >
        {isOpen ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <>
            <Accessibility className="w-4 h-4 md:mr-1" />
            <ChevronLeft className="w-4 h-4 hidden md:block" />
          </>
        )}
      </Button>

      {/* Panel */}
      <div
        className={`transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } absolute right-0 top-0 max-h-[calc(100vh-40px)] flex flex-col`}
      >
        <Card className="w-80 md:w-96 shadow-xl border-l-0 rounded-l-lg rounded-r-none max-h-[calc(100vh-40px)] flex flex-col overflow-hidden">
          <CardHeader className="pb-3 flex flex-row items-center justify-between bg-card z-10 border-b flex-shrink-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Accessibility className="w-5 h-5" />
              <span className="hidden md:inline">Accesibilidad</span>
              <span className="md:hidden">A11y</span>
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
          
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pb-6">
            {/* Font Size Controls */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                <Label className="font-medium text-sm md:text-base">Tamaño de texto</Label>
              </div>
              
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground">
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
                
                <div className="flex gap-1 md:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decreaseFontSize}
                    className="flex-1 text-xs md:text-sm h-8 md:h-9"
                    disabled={fontScale <= 75}
                  >
                    <Minus className="w-3 h-3 mr-1" />
                    -25%
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFontScale(100)}
                    className="flex-1 text-xs md:text-sm h-8 md:h-9"
                  >
                    Normal
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={increaseFontSize}
                    className="flex-1 text-xs md:text-sm h-8 md:h-9"
                    disabled={fontScale >= 200}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    +25%
                  </Button>
                </div>
              </div>
            </div>

            {/* High Contrast Toggle */}
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2">
                <Contrast className="w-4 h-4" />
                <Label className="font-medium text-sm md:text-base">Alto contraste</Label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1 mr-3">
                  <p className="text-xs md:text-sm text-muted-foreground">
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
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2">
                {textToSpeechEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                <Label className="font-medium text-sm md:text-base">Lectura de texto</Label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1 mr-3">
                  <p className="text-xs md:text-sm text-muted-foreground">
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

            {/* Keyboard Navigation Toggle */}
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4" />
                <Label className="font-medium text-sm md:text-base">Navegación por teclado</Label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1 mr-3">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Mejora la visibilidad del foco al navegar con teclado
                  </p>
                </div>
                <Switch
                  checked={keyboardNavigation}
                  onCheckedChange={setKeyboardNavigation}
                  aria-label="Activar navegación por teclado mejorada"
                />
              </div>
            </div>

            {/* Reduce Motion Toggle */}
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <Label className="font-medium text-sm md:text-base">Reducir movimiento</Label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1 mr-3">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Desactiva animaciones y transiciones para reducir mareos
                  </p>
                </div>
                <Switch
                  checked={reduceMotion}
                  onCheckedChange={setReduceMotion}
                  aria-label="Activar reducción de movimiento"
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="p-3 md:p-4 bg-muted/50 rounded-lg">
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground block mb-2">Instrucciones:</strong>
                <span className="block mb-1">• <strong>Tamaño:</strong> Deslizador o botones ±25%</span>
                <span className="block mb-1">• <strong>Contraste:</strong> Mejora visibilidad</span>
                <span className="block mb-1">• <strong>Lectura:</strong> Hover para escuchar</span>
                <span className="block mb-1">• <strong>Teclado:</strong> Navegación con Tab/Flechas</span>
                <span className="block mb-1">• <strong>Movimiento:</strong> Reduce animaciones</span>
                <span className="block text-xs text-muted-foreground/80 mt-2">Los cambios se aplican inmediatamente</span>
              </p>
            </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AccessibilityPanel;