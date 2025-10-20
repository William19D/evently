/**
 * Utility para extraer y formatear mensajes de error user-friendly
 */

export interface ParsedError {
  message: string;
  type: 'validation' | 'auth' | 'network' | 'server' | 'verification' | 'unknown';
  field?: string;
}

/**
 * Extrae el mensaje de error del servidor desde diferentes formatos
 */
export function extractServerMessage(error: any): string | null {
  try {
    console.log('🔍 Extracting message from error:', error);

    // Si el error ya es un string, procesarlo
    if (typeof error === 'string') {
      // Buscar JSON embebido en strings que contienen HTTP info
      const jsonMatch = error.match(/\{"error":"([^"]+)"[^}]*\}/);
      if (jsonMatch) {
        console.log('✅ Extracted from JSON in string:', jsonMatch[1]);
        return jsonMatch[1];
      }
      
      // Si no contiene info técnica, retornarlo tal como está
      if (!error.includes('HTTP') && !error.includes('timestamp') && !error.includes('requestId')) {
        console.log('✅ Clean string message:', error);
        return error;
      }
      
      // Si contiene HTTP pero tiene un mensaje después de los dos puntos
      const httpMatch = error.match(/HTTP \d+:\s*(.+?)(?:\s*$|\s*\{"timestamp)/);
      if (httpMatch && httpMatch[1]) {
        try {
          // Intentar parsear como JSON
          const parsed = JSON.parse(httpMatch[1]);
          if (parsed.error) {
            console.log('✅ Extracted from HTTP message JSON:', parsed.error);
            return parsed.error;
          }
        } catch {
          // Si no es JSON válido, usar el mensaje tal como está
          console.log('✅ Extracted from HTTP message text:', httpMatch[1]);
          return httpMatch[1].trim();
        }
      }
    }

    // Si el error es un objeto con propiedad error
    if (error?.error && typeof error.error === 'string') {
      console.log('✅ Direct error property:', error.error);
      return error.error;
    }

    // Si el error tiene un mensaje directo en un objeto
    if (error?.message && typeof error.message === 'string') {
      // Buscar JSON embebido en el mensaje
      const jsonMatch = error.message.match(/\{"error":"([^"]+)"[^}]*\}/);
      if (jsonMatch) {
        console.log('✅ Extracted from message JSON:', jsonMatch[1]);
        return jsonMatch[1];
      }
      
      // Si no hay JSON y no contiene info técnica, usar el mensaje tal como está
      if (!error.message.includes('HTTP') && !error.message.includes('stack') && !error.message.includes('timestamp')) {
        console.log('✅ Clean message property:', error.message);
        return error.message;
      }
    }

    // Si el error completo está en fullError
    if (error?.fullError?.message) {
      const jsonMatch = error.fullError.message.match(/\{"error":"([^"]+)"[^}]*\}/);
      if (jsonMatch) {
        console.log('✅ Extracted from fullError JSON:', jsonMatch[1]);
        return jsonMatch[1];
      }
    }

    // Si es un objeto de respuesta con data
    if (error?.data?.error) {
      console.log('✅ Error from data property:', error.data.error);
      return error.data.error;
    }

    // Si es un objeto de respuesta directa
    if (error?.response?.data?.error) {
      console.log('✅ Error from response.data:', error.response.data.error);
      return error.response.data.error;
    }

    console.log('❌ Could not extract message from error');
    return null;
  } catch (e) {
    console.warn('❌ Error parsing server message:', e);
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

    // Errores de verificación de email
    if (lowerMessage.includes('email not confirmed') || 
        lowerMessage.includes('email no confirmado') ||
        lowerMessage.includes('not confirmed') ||
        lowerMessage.includes('verificar email') ||
        lowerMessage.includes('confirmar email')) {
      return {
        message: 'Debes verificar tu email antes de poder iniciar sesión.',
        type: 'verification'
      };
    }

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

    // Errores de verificación y email no confirmado
    if (lowerMessage.includes('verification') || lowerMessage.includes('verificación') || 
        lowerMessage.includes('email not confirmed') || lowerMessage.includes('not confirmed') ||
        lowerMessage.includes('verificar tu email') || lowerMessage.includes('confirm your email')) {
      if (lowerMessage.includes('code') || lowerMessage.includes('código')) {
        return {
          message: 'Código de verificación incorrecto. Intenta de nuevo.',
          type: 'auth'
        };
      }
      return {
        message: 'Tu email no ha sido verificado. Revisa tu bandeja de entrada y haz clic en el enlace de verificación que te enviamos.',
        type: 'verification'
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

/**
 * Hook para obtener el error parseado completo con tipo
 */
export function getParsedError(error: any): ParsedError {
  return parseError(error);
}
