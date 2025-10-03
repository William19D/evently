/**
 * Utility para extraer y formatear mensajes de error user-friendly
 */

export interface ParsedError {
  message: string;
  type: 'validation' | 'auth' | 'network' | 'server' | 'unknown';
  field?: string;
}

/**
 * Extrae el mensaje de error del servidor desde diferentes formatos
 */
export function extractServerMessage(error: any): string | null {
  try {
    // Si el error ya es un string simple
    if (typeof error === 'string') {
      return error;
    }

    // Si el error tiene un mensaje directo
    if (error?.message && typeof error.message === 'string') {
      // Buscar JSON embebido en el mensaje
      const jsonMatch = error.message.match(/{"error":"([^"]+)"/);
      if (jsonMatch) {
        return jsonMatch[1];
      }
      
      // Si no hay JSON, usar el mensaje tal como está (pero filtrar info técnica)
      if (!error.message.includes('HTTP') && !error.message.includes('stack')) {
        return error.message;
      }
    }

    // Si el error tiene una propiedad error directa
    if (error?.error && typeof error.error === 'string') {
      return error.error;
    }

    // Si el error completo está en fullError
    if (error?.fullError?.message) {
      const jsonMatch = error.fullError.message.match(/{"error":"([^"]+)"/);
      if (jsonMatch) {
        return jsonMatch[1];
      }
    }

    return null;
  } catch (e) {
    console.warn('Error parsing server message:', e);
    return null;
  }
}

/**
 * Convierte errores técnicos en mensajes user-friendly
 */
export function parseError(error: any): ParsedError {
  console.log('🔍 Parsing error:', error);

  // Extraer mensaje del servidor
  const serverMessage = extractServerMessage(error);
  console.log('📝 Extracted server message:', serverMessage);

  if (serverMessage) {
    // Mapear mensajes específicos del servidor
    const lowerMessage = serverMessage.toLowerCase();

    // Errores de usuario existente
    if (lowerMessage.includes('usuario ya existe')) {
      if (lowerMessage.includes('verificado')) {
        return {
          message: 'Esta cuenta ya existe y está verificada. Puedes iniciar sesión directamente.',
          type: 'auth'
        };
      } else {
        return {
          message: 'Esta cuenta ya existe pero no está verificada. Revisa tu email para confirmar tu cuenta.',
          type: 'auth'
        };
      }
    }

    // Errores de email
    if (lowerMessage.includes('email') || lowerMessage.includes('correo')) {
      if (lowerMessage.includes('formato') || lowerMessage.includes('válido') || lowerMessage.includes('invalid')) {
        return {
          message: 'Por favor ingresa un email válido.',
          type: 'validation',
          field: 'email'
        };
      }
      if (lowerMessage.includes('ya existe') || lowerMessage.includes('already exists')) {
        return {
          message: 'Este email ya está registrado. ¿Quieres iniciar sesión?',
          type: 'auth',
          field: 'email'
        };
      }
    }

    // Errores de contraseña
    if (lowerMessage.includes('contraseña') || lowerMessage.includes('password')) {
      if (lowerMessage.includes('corta') || lowerMessage.includes('short') || lowerMessage.includes('6')) {
        return {
          message: 'La contraseña debe tener al menos 6 caracteres.',
          type: 'validation',
          field: 'password'
        };
      }
      if (lowerMessage.includes('incorrecta') || lowerMessage.includes('incorrect') || lowerMessage.includes('wrong')) {
        return {
          message: 'Contraseña incorrecta. Intenta de nuevo.',
          type: 'auth',
          field: 'password'
        };
      }
    }

    // Errores de autenticación
    if (lowerMessage.includes('credenciales') || lowerMessage.includes('credentials')) {
      return {
        message: 'Email o contraseña incorrectos. Verifica tus datos.',
        type: 'auth'
      };
    }

    // Errores de verificación
    if (lowerMessage.includes('verification') || lowerMessage.includes('verificación')) {
      if (lowerMessage.includes('code') || lowerMessage.includes('código')) {
        return {
          message: 'Código de verificación incorrecto. Intenta de nuevo.',
          type: 'auth'
        };
      }
      return {
        message: 'Error en la verificación. Por favor intenta de nuevo.',
        type: 'auth'
      };
    }

    // Errores de envío de correo de confirmación (mapear mensajes técnicos a uno amigable)
    if (
      lowerMessage.includes('sending confirmation') ||
      lowerMessage.includes('error sending confirmation') ||
      lowerMessage.includes('confirmation email') ||
      (lowerMessage.includes('enviar') && lowerMessage.includes('confirm')) ||
      lowerMessage.includes('no se pudo enviar') ||
      lowerMessage.includes('error enviando')
    ) {
      return {
        message: 'No se pudo enviar el correo de confirmación. Por favor intenta nuevamente más tarde.',
        type: 'server'
      };
    }

    // Errores de MFA
    if (lowerMessage.includes('mfa') || lowerMessage.includes('2fa') || lowerMessage.includes('factor')) {
      return {
        message: 'Código de autenticación de dos factores incorrecto.',
        type: 'auth'
      };
    }

    // Si hay un mensaje del servidor pero no coincide con patrones conocidos, usarlo tal como está
    return {
      message: serverMessage,
      type: 'server'
    };
  }

  // Errores de red
  if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
    return {
      message: 'Error de conexión. Verifica tu internet e intenta de nuevo.',
      type: 'network'
    };
  }

  // Errores HTTP específicos
  if (error?.status) {
    switch (error.status) {
      case 400:
        return {
          message: 'Datos inválidos. Revisa la información ingresada.',
          type: 'validation'
        };
      case 401:
        return {
          message: 'No tienes autorización. Inicia sesión de nuevo.',
          type: 'auth'
        };
      case 403:
        return {
          message: 'No tienes permisos para realizar esta acción.',
          type: 'auth'
        };
      case 404:
        return {
          message: 'El recurso solicitado no fue encontrado.',
          type: 'server'
        };
      case 500:
        return {
          message: 'Error del servidor. Intenta de nuevo en unos momentos.',
          type: 'server'
        };
      default:
        return {
          message: `Error del servidor (${error.status}). Intenta de nuevo.`,
          type: 'server'
        };
    }
  }

  // Error genérico
  return {
    message: 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
    type: 'unknown'
  };
}

/**
 * Hook para mostrar errores user-friendly
 */
export function getDisplayError(error: any): string {
  const parsed = parseError(error);
  return parsed.message;
}
