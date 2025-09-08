import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ExternalLink } from 'lucide-react';

interface RecaptchaConfigErrorProps {
  error: string | null;
  siteKey: string | undefined;
}

export const RecaptchaConfigError: React.FC<RecaptchaConfigErrorProps> = ({ error, siteKey }) => {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="space-y-2">
        <div>
          <strong>Error de configuración reCAPTCHA:</strong>
        </div>
        <div className="text-sm">
          {error}
        </div>
        <div className="text-sm space-y-1">
          <div><strong>Clave actual:</strong> <code className="bg-red-100 px-1 rounded">{siteKey || 'No definida'}</code></div>
          <div><strong>Para solucionarlo:</strong></div>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Ve a <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Google reCAPTCHA Admin <ExternalLink className="w-3 h-3" /></a></li>
            <li>Crea un nuevo sitio con tipo "reCAPTCHA v3"</li>
            <li>Agrega los dominios: <code>localhost</code> y tu dominio de producción</li>
            <li>Copia la "Site Key" y agrégala como <code>VITE_RECAPTCHA_SITE_KEY</code> en tu archivo .env</li>
            <li>Reinicia el servidor de desarrollo</li>
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default RecaptchaConfigError;
