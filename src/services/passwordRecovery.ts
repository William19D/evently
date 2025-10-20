/**
 * Password Recovery Service
 * Maneja la recuperación de contraseña usando la Edge Function personalizada
 */

const EDGE_FUNCTION_URL = 'https://xchgmvpzygpenccnidtq.supabase.co/functions/v1/password';

export interface PasswordRecoveryResponse {
  success: boolean;
  message: string;
  emailSent: boolean;
  expiresIn?: string;
  securityNote?: string;
  metadata?: {
    requestId: string;
    timestamp: string;
    emailId?: string;
  };
  error?: string;
  timestamp?: string;
  requestId?: string;
}

/**
 * Envía una solicitud de recuperación de contraseña
 * @param email - El email del usuario que quiere recuperar su contraseña
 * @returns Promise con la respuesta del servidor
 */
export async function requestPasswordRecovery(email: string): Promise<PasswordRecoveryResponse> {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Si hay un error, devolvemos la respuesta con success: false
      return {
        success: false,
        message: data.error || 'Error al procesar la solicitud',
        emailSent: false,
        error: data.error,
        timestamp: data.timestamp,
        requestId: data.requestId,
      };
    }

    return data;
  } catch (error) {
    console.error('Error en requestPasswordRecovery:', error);
    
    return {
      success: false,
      message: 'Error de conexión. Por favor intenta de nuevo.',
      emailSent: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Valida el formato de un email
 * @param email - El email a validar
 * @returns true si el email es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
