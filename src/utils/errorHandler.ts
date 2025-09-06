export interface UserFriendlyError {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  action?: string;
}

/**
 * Convierte errores técnicos en mensajes user-friendly
 */
export function parseAuthError(error: any): UserFriendlyError {
  console.log('🔍 parseAuthError - Raw error:', error);
  
  // Extraer el mensaje de error del objeto complejo
  let errorMessage = '';
  let errorCode = '';
  
  try {
    // Si es un error con fullError que contiene JSON
    if (error?.fullError?.message) {
      const fullMessage = error.fullError.message;
      console.log('📝 Parsing fullError message:', fullMessage);
      
      // Buscar JSON en el mensaje de error
      const jsonMatch = fullMessage.match(/\{"error":"([^"]+)"/);
      if (jsonMatch) {
        errorMessage = jsonMatch[1];
      }
    }
    
    // Si es un error directo con message
    if (!errorMessage && error?.message) {
      const message = error.message;
      console.log('📝 Parsing direct message:', message);
      
      // Buscar JSON en el mensaje
      const jsonMatch = message.match(/\{"error":"([^"]+)"/);
      if (jsonMatch) {
        errorMessage = jsonMatch[1];
      } else {
        errorMessage = message;
      }
    }
    
    // Si es un string directo
    if (!errorMessage && typeof error === 'string') {
      const jsonMatch = error.match(/\{"error":"([^"]+)"/);
      if (jsonMatch) {
        errorMessage = jsonMatch[1];
      } else {
        errorMessage = error;
      }
    }
    
    // Detectar código de error HTTP
    const httpMatch = (error?.message || error?.fullError?.message || '').match(/HTTP (\d+):/);
    if (httpMatch) {
      errorCode = httpMatch[1];
    }
    
  } catch (parseError) {
    console.error('❌ Error parsing auth error:', parseError);
    errorMessage = 'Error de conexión. Por favor intenta de nuevo.';
  }
  
  console.log('🎯 Extracted error message:', errorMessage);
  console.log('🎯 Extracted error code:', errorCode);
  
  // Mapear errores específicos a mensajes user-friendly
  const errorMappings: Record<string, UserFriendlyError> = {
    // Errores de registro
    'El usuario ya existe y está verificado. Intenta iniciar sesión.': {
      title: 'Cuenta ya existe',
      message: 'Ya tienes una cuenta con este email. ¡Inicia sesión en su lugar!',
      type: 'warning',
      action: 'Ir a iniciar sesión'
    },
    'El email ya está registrado': {
      title: 'Email ya registrado',
      message: 'Este email ya está en uso. ¿Ya tienes una cuenta?',
      type: 'warning',
      action: 'Iniciar sesión'
    },
    
    // Errores de login
    'Credenciales inválidas': {
      title: 'Datos incorrectos',
      message: 'Email o contraseña incorrectos. Verifica tus datos e intenta de nuevo.',
      type: 'error'
    },
    'Invalid credentials': {
      title: 'Datos incorrectos',
      message: 'Email o contraseña incorrectos. Verifica tus datos e intenta de nuevo.',
      type: 'error'
    },
    'Usuario no encontrado': {
      title: 'Usuario no encontrado',
      message: 'No encontramos una cuenta con este email. ¿Necesitas registrarte?',
      type: 'warning',
      action: 'Crear cuenta'
    },
    
    // Errores de MFA
    'Código MFA inválido': {
      title: 'Código incorrecto',
      message: 'El código de verificación no es válido. Verifica el código en tu app de autenticación.',
      type: 'error'
    },
    'Código MFA expirado': {
      title: 'Código expirado',
      message: 'El código ha expirado. Genera un nuevo código e intenta de nuevo.',
      type: 'warning'
    },
    'MFA no configurado': {
      title: 'Autenticación no configurada',
      message: 'Necesitas configurar la autenticación de dos factores primero.',
      type: 'info',
      action: 'Configurar MFA'
    },
    
    // Errores de conexión
    'Network error': {
      title: 'Error de conexión',
      message: 'No pudimos conectar con el servidor. Verifica tu conexión a internet.',
      type: 'error'
    },
    'Server error': {
      title: 'Error del servidor',
      message: 'Hubo un problema en el servidor. Por favor intenta de nuevo en unos momentos.',
      type: 'error'
    },
    
    // Errores de validación
    'Email inválido': {
      title: 'Email inválido',
      message: 'Por favor ingresa un email válido.',
      type: 'warning'
    },
    'Contraseña muy corta': {
      title: 'Contraseña muy corta',
      message: 'La contraseña debe tener al menos 8 caracteres.',
      type: 'warning'
    },
    
    // Errores de permisos
    'Unauthorized': {
      title: 'Sin autorización',
      message: 'No tienes permisos para realizar esta acción.',
      type: 'error'
    },
    'Forbidden': {
      title: 'Acceso denegado',
      message: 'No tienes acceso a este recurso.',
      type: 'error'
    }
  };
  
  // Buscar coincidencia exacta
  if (errorMessage && errorMappings[errorMessage]) {
    console.log('✅ Found exact match for error:', errorMessage);
    return errorMappings[errorMessage];
  }
  
  // Buscar coincidencias parciales
  for (const [key, mapping] of Object.entries(errorMappings)) {
    if (errorMessage && errorMessage.toLowerCase().includes(key.toLowerCase())) {
      console.log('✅ Found partial match for error:', key);
      return mapping;
    }
  }
  
  // Mapear por código HTTP
  const httpErrorMappings: Record<string, UserFriendlyError> = {
    '400': {
      title: 'Datos inválidos',
      message: 'Los datos enviados no son válidos. Por favor verifica e intenta de nuevo.',
      type: 'warning'
    },
    '401': {
      title: 'No autorizado',
      message: 'Necesitas iniciar sesión para continuar.',
      type: 'warning',
      action: 'Iniciar sesión'
    },
    '403': {
      title: 'Acceso denegado',
      message: 'No tienes permisos para realizar esta acción.',
      type: 'error'
    },
    '404': {
      title: 'No encontrado',
      message: 'El recurso solicitado no fue encontrado.',
      type: 'warning'
    },
    '500': {
      title: 'Error del servidor',
      message: 'Hubo un problema en el servidor. Por favor intenta de nuevo más tarde.',
      type: 'error'
    },
    '503': {
      title: 'Servicio no disponible',
      message: 'El servicio no está disponible temporalmente. Intenta de nuevo en unos minutos.',
      type: 'warning'
    }
  };
  
  if (errorCode && httpErrorMappings[errorCode]) {
    console.log('✅ Found HTTP code match:', errorCode);
    return httpErrorMappings[errorCode];
  }
  
  // Error genérico como fallback
  console.log('⚠️ Using generic error fallback');
  return {
    title: 'Error inesperado',
    message: errorMessage || 'Ha ocurrido un error inesperado. Por favor intenta de nuevo.',
    type: 'error'
  };
}

/**
 * Convierte errores de validación de formularios
 */
export function parseValidationError(field: string, error: any): UserFriendlyError {
  const validationMappings: Record<string, UserFriendlyError> = {
    email: {
      title: 'Email inválido',
      message: 'Por favor ingresa un email válido.',
      type: 'warning'
    },
    password: {
      title: 'Contraseña inválida',
      message: 'La contraseña debe tener al menos 8 caracteres.',
      type: 'warning'
    },
    confirmPassword: {
      title: 'Contraseñas no coinciden',
      message: 'Las contraseñas no coinciden. Verifica e intenta de nuevo.',
      type: 'warning'
    },
    name: {
      title: 'Nombre requerido',
      message: 'Por favor ingresa tu nombre.',
      type: 'warning'
    },
    phone: {
      title: 'Teléfono inválido',
      message: 'Por favor ingresa un número de teléfono válido.',
      type: 'warning'
    }
  };
  
  return validationMappings[field] || {
    title: 'Campo inválido',
    message: `Por favor verifica el campo ${field}.`,
    type: 'warning'
  };
}

/**
 * Hook para mostrar errores user-friendly
 */
export function useErrorHandler() {
  const showError = (error: any, context?: string) => {
    console.log(`🚨 Error Handler [${context || 'UNKNOWN'}]:`, error);
    
    const friendlyError = parseAuthError(error);
    
    // Aquí puedes integrar con tu sistema de notificaciones
    // Por ejemplo, con react-hot-toast o tu componente de toast
    console.log('📢 User-friendly error:', friendlyError);
    
    return friendlyError;
  };
  
  return { showError, parseAuthError, parseValidationError };
}
