# Implementación de reCAPTCHA v3 - Evently

Este documento describe la implementación completa de reCAPTCHA v3 en todos los formularios de autenticación de Evently.

## 🔧 Configuración

### Variables de Entorno
- `VITE_RECAPTCHA_SITE_KEY`: Clave del sitio reCAPTCHA v3 para el frontend
- `RECAPTCHA_KEY`: Clave secreta reCAPTCHA v3 configurada en Supabase Edge Functions

### Edge Function
La edge function de auth (`/functions/v1/auth`) ahora incluye verificación reCAPTCHA para:
- ✅ `register` - Registro de usuarios
- ✅ `signin` - Inicio de sesión

## 🎯 Archivos Modificados

### 1. Hook de reCAPTCHA
- **Archivo**: `src/hooks/use-recaptcha.ts`
- **Funciones**:
  - `loadRecaptcha()`: Carga el script de reCAPTCHA v3
  - `executeRecaptcha(action)`: Ejecuta reCAPTCHA y obtiene token

### 2. Cliente de Autenticación
- **Archivo**: `src/lib/authClient.ts`
- **Cambios**:
  - `signIn()` ahora acepta parámetro `recaptchaToken`
  - `register()` ahora acepta parámetro `recaptchaToken`

### 3. Contexto de Autenticación
- **Archivo**: `src/contexts/AuthContext.tsx`
- **Cambios**:
  - `signIn()` actualizado para incluir reCAPTCHA
  - Nueva función `register()` con soporte reCAPTCHA

### 4. Formularios Actualizados

#### Login Forms
- ✅ `src/pages/ClientLogin.tsx`
- ✅ `src/pages/OwnerLogin.tsx`
- ✅ `src/pages/SuperadminLogin.tsx`
- ✅ `src/pages/Login.tsx`

#### Register Forms
- ✅ `src/pages/ClientRegister.tsx`
- ✅ `src/pages/OwnerRegister.tsx`

### 5. Componente Visual
- **Archivo**: `src/components/RecaptchaBadge.tsx`
- **Propósito**: Indicador visual del estado de reCAPTCHA

## 🚀 Flujo de Implementación

### Para Formularios de Login:
1. Se carga reCAPTCHA al montar el componente
2. Al enviar el formulario:
   - Se ejecuta `executeRecaptcha('login')`
   - Se obtiene el token reCAPTCHA
   - Se envía al backend junto con credenciales
3. El backend verifica el token antes de procesar

### Para Formularios de Registro:
1. Se carga reCAPTCHA al montar el componente
2. Al enviar el formulario:
   - Se ejecuta `executeRecaptcha('register')`
   - Se obtiene el token reCAPTCHA
   - Se envía al backend junto con datos de registro
3. El backend verifica el token antes de crear usuario

## 🔒 Acciones reCAPTCHA

- `login`: Para formularios de inicio de sesión
- `register`: Para formularios de registro

## ⚡ Funcionalidades

### Manejo de Errores
- Errores específicos de reCAPTCHA se muestran como "Error de verificación de seguridad"
- Fallback a mensajes genéricos para otros errores

### Experiencia de Usuario
- Carga automática y transparente de reCAPTCHA
- Sin interferencia visual (reCAPTCHA v3 es invisible)
- Indicadores de estado opcionales con `RecaptchaBadge`

### Seguridad
- Verificación del score reCAPTCHA en el backend
- Validación de tokens únicos y no expirados
- Protección contra bots y actividad sospechosa

## 🧪 Testing

Para probar la implementación:

1. **Desarrollo**: Los tokens reCAPTCHA funcionan en localhost
2. **Producción**: Configurar dominio en la consola de reCAPTCHA
3. **Verificar logs**: Los logs del backend muestran el proceso de verificación

## 📝 Notas Importantes

- reCAPTCHA v3 es completamente invisible para el usuario
- El score se evalúa en el backend (mínimo 0.5)
- Los tokens tienen una validez limitada en tiempo
- La implementación es compatible con el sistema MFA existente

## 🔧 Configuración de reCAPTCHA en Google

1. Ir a [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Crear un nuevo sitio con:
   - Tipo: reCAPTCHA v3
   - Dominios: localhost, tu-dominio.com
3. Copiar las claves:
   - Site Key → `VITE_RECAPTCHA_SITE_KEY`
   - Secret Key → `RECAPTCHA_KEY` (en Supabase)

## ✅ Estado de Implementación

- [x] Hook de reCAPTCHA
- [x] Cliente de autenticación
- [x] Contexto de autenticación  
- [x] ClientLogin.tsx
- [x] ClientRegister.tsx
- [x] OwnerLogin.tsx
- [x] OwnerRegister.tsx
- [x] SuperadminLogin.tsx
- [x] Login.tsx
- [x] Componente RecaptchaBadge
- [x] Edge function compatible
- [x] Manejo de errores
- [x] Documentación

¡Implementación de reCAPTCHA v3 completada exitosamente! 🎉
