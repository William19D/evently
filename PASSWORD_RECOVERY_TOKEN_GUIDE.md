# 🔐 Manejo del Token de Recuperación - Guía Técnica

## 📋 Resumen

Esta guía explica paso a paso cómo se maneja el token de recuperación de contraseña cuando el usuario hace clic en el enlace del email.

## 🔗 Estructura del Enlace de Recuperación

### URL Generada por Supabase
```
https://app.evently.blog/reset-password#access_token=eyJhbG...&type=recovery&refresh_token=v1.MR...&expires_in=3600
```

### Componentes del Hash:
- `access_token`: Token JWT de acceso temporal
- `type`: Tipo de token (`recovery`)
- `refresh_token`: Token para refrescar la sesión
- `expires_in`: Tiempo de expiración en segundos (3600 = 1 hora)

## 🔄 Flujo de Validación del Token

### 1. Usuario hace clic en el enlace del email

```
Email → Click en botón/link
       ↓
Abre: https://app.evently.blog/reset-password#access_token=...&type=recovery
```

### 2. ResetPassword.tsx se carga

```typescript
// src/pages/ResetPassword.tsx
useEffect(() => {
  const validateRecoveryToken = async () => {
    // Obtener el hash de la URL
    const hash = window.location.hash;
    // Ejemplo: "#access_token=eyJhbG...&type=recovery&refresh_token=v1.MR..."
  };
}, []);
```

### 3. Extracción de parámetros del hash

```typescript
// Extraer parámetros del hash (#)
const hashParams = new URLSearchParams(hash.substring(1));

// Obtener valores individuales
const accessToken = hashParams.get('access_token');
const type = hashParams.get('type');
const refreshToken = hashParams.get('refresh_token');

console.log('Token type:', type); // "recovery"
console.log('Has access token:', !!accessToken); // true
```

**¿Por qué del hash (#)?**
- Supabase usa hash (#) en lugar de query params (?) por seguridad
- Los parámetros en el hash no se envían al servidor
- Solo JavaScript del lado del cliente puede acceder a ellos

### 4. Validación del tipo de token

```typescript
if (type === 'recovery' && accessToken) {
  console.log('✅ Valid recovery token detected');
  // Continuar con el proceso
} else {
  console.log('❌ Invalid or missing recovery token');
  // Mostrar error
}
```

### 5. Establecer sesión temporal con Supabase

```typescript
const { data, error } = await supabase.auth.setSession({
  access_token: accessToken,
  refresh_token: refreshToken || '',
});

if (error) {
  console.error('❌ Error setting session:', error);
  throw error;
}

if (data.user) {
  console.log('✅ Session established successfully');
  setTokenValid(true); // Permitir acceso al formulario
}
```

**¿Qué hace `setSession`?**
- Establece una sesión temporal en Supabase
- Permite al usuario actualizar su contraseña
- La sesión solo es válida mientras el token no expire

### 6. Usuario ve el formulario

```typescript
if (tokenValid) {
  // Mostrar formulario de nueva contraseña
  return <FormularioNuevaContraseña />;
} else {
  // Mostrar error de token inválido
  return <ErrorTokenInvalido />;
}
```

## 🎯 Estados del Token

### Estado 1: Validando
```typescript
const [isValidatingToken, setIsValidatingToken] = useState(true);
```

**UI mostrada:**
```
┌─────────────────────────────────┐
│  ⌛ Validando enlace            │
│  Verificando tu enlace de...    │
│                                 │
│  [Loading spinner]              │
│                                 │
│  Por favor espera mientras...   │
└─────────────────────────────────┘
```

### Estado 2: Token Válido
```typescript
const [tokenValid, setTokenValid] = useState(true);
```

**UI mostrada:**
```
┌─────────────────────────────────┐
│  🔐 Nueva Contraseña            │
│  Crea una contraseña segura...  │
│                                 │
│  Nueva Contraseña:              │
│  [••••••••    ] 👁️             │
│  Seguridad: ████████░░ Fuerte   │
│                                 │
│  Confirmar Contraseña:          │
│  [••••••••    ] 👁️             │
│                                 │
│  ✓ Mínimo 8 caracteres          │
│  ✓ Al menos una mayúscula       │
│  ✓ Al menos una minúscula       │
│  ✓ Al menos un número           │
│  ✓ Al menos un carácter especial│
│                                 │
│  [Actualizar Contraseña]        │
│  [Cancelar]                     │
└─────────────────────────────────┘
```

### Estado 3: Token Inválido
```typescript
const [tokenValid, setTokenValid] = useState(false);
```

**UI mostrada:**
```
┌─────────────────────────────────┐
│  ❌ Enlace Inválido             │
│  No pudimos validar tu enlace   │
│                                 │
│  [X icon]                       │
│                                 │
│  ⚠️ Enlace Inválido o Expirado  │
│  • El enlace puede haber...     │
│  • Ya fue utilizado...          │
│  • No es un enlace válido...    │
│                                 │
│  [Solicitar nuevo enlace]       │
│  [← Volver al inicio de sesión] │
└─────────────────────────────────┘
```

## 🔧 Actualización de Contraseña

### 1. Usuario completa el formulario

```typescript
const handleResetPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validar contraseñas
  const validatedData = passwordSchema.parse({ 
    password, 
    confirmPassword 
  });
  
  // Actualizar contraseña
  const { error } = await supabase.auth.updateUser({
    password: validatedData.password,
  });
  
  if (error) throw error;
  
  // Éxito
  setResetSuccess(true);
};
```

### 2. Cierre de sesión automático

```typescript
// Después de actualizar la contraseña
await supabase.auth.signOut();

// Redirigir al login
setTimeout(() => {
  navigate("/login-selection", {
    state: {
      message: "Contraseña actualizada exitosamente...",
    },
  });
}, 3000);
```

## 🚨 Casos de Error Comunes

### Error 1: Token Expirado (>1 hora)
```
❌ Token has expired

Solución: Solicitar nuevo enlace de recuperación
```

### Error 2: Token Ya Usado
```
❌ Token has already been used

Solución: Cada token solo puede usarse UNA vez
```

### Error 3: Token Inválido
```
❌ Invalid token format

Solución: Verificar que la URL sea correcta
```

### Error 4: No hay sesión de recuperación
```
❌ No recovery session found

Solución: El usuario debe hacer clic en el enlace del email
```

## 🔍 Debugging

### Verificar Token en Consola
```typescript
useEffect(() => {
  const hash = window.location.hash;
  console.log('🔍 Full hash:', hash);
  
  const hashParams = new URLSearchParams(hash.substring(1));
  console.log('📋 Hash params:', {
    access_token: hashParams.get('access_token')?.substring(0, 20) + '...',
    type: hashParams.get('type'),
    refresh_token: hashParams.get('refresh_token')?.substring(0, 20) + '...',
    expires_in: hashParams.get('expires_in')
  });
}, []);
```

### Verificar Sesión
```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log('📋 Current session:', {
  hasSession: !!session,
  userId: session?.user?.id,
  email: session?.user?.email,
  expiresAt: session?.expires_at
});
```

## 🔐 Seguridad

### ✅ Buenas Prácticas Implementadas

1. **Token en Hash (#)** - No se envía al servidor
2. **Validación inmediata** - Al cargar la página
3. **Sesión temporal** - Solo para actualizar contraseña
4. **Cierre automático** - Después de actualizar
5. **Uso único** - El token no puede reutilizarse
6. **Expiración** - 1 hora de validez
7. **Validación fuerte** - 8+ chars, mayús, minus, número, especial

### ❌ Lo que NO se hace (por seguridad)

1. **No almacenar el token** - Solo se usa temporalmente
2. **No enviar el token por query params** - Solo hash
3. **No permitir múltiples usos** - Un token, un uso
4. **No extender la expiración** - 1 hora fija
5. **No permitir contraseñas débiles** - Validación estricta

## 📊 Diagrama de Estados

```
[INICIO]
   ↓
[Cargando página /reset-password]
   ↓
[Extrayendo token del hash]
   ↓
¿Hay access_token y type=recovery?
   ├─ NO → [Mostrar error: Token inválido]
   │          ↓
   │      [Opciones: Solicitar nuevo / Volver]
   │
   └─ SÍ → [Llamar a supabase.auth.setSession()]
             ↓
         ¿Sesión establecida correctamente?
             ├─ NO → [Mostrar error: Token expirado/usado]
             │          ↓
             │      [Opciones: Solicitar nuevo / Volver]
             │
             └─ SÍ → [Mostrar formulario de contraseña]
                       ↓
                   [Usuario ingresa contraseña]
                       ↓
                   [Validación en tiempo real]
                       ↓
                   [Submit formulario]
                       ↓
                   [supabase.auth.updateUser()]
                       ↓
                   ¿Actualización exitosa?
                       ├─ NO → [Mostrar error]
                       │          ↓
                       │      [Reintentar]
                       │
                       └─ SÍ → [Mostrar éxito]
                                 ↓
                             [Cerrar sesión]
                                 ↓
                             [Redirigir a login]
                                 ↓
                             [FIN]
```

## 🧪 Testing del Token

### Test 1: Token Válido
```bash
# URL de prueba
https://app.evently.blog/reset-password#access_token=eyJhbG...&type=recovery&refresh_token=v1.MR...

# Resultado esperado
✅ Muestra formulario de nueva contraseña
```

### Test 2: Token Inválido
```bash
# URL de prueba
https://app.evently.blog/reset-password#access_token=invalid&type=recovery

# Resultado esperado
❌ Muestra error: "Enlace Inválido o Expirado"
```

### Test 3: Sin Token
```bash
# URL de prueba
https://app.evently.blog/reset-password

# Resultado esperado
❌ Muestra error: "Enlace Inválido o Expirado"
```

### Test 4: Tipo Incorrecto
```bash
# URL de prueba
https://app.evently.blog/reset-password#access_token=eyJhbG...&type=signup

# Resultado esperado
❌ Muestra error: "Enlace Inválido o Expirado"
```

## 📝 Resumen

1. ✅ Token viene en el **hash** de la URL (#)
2. ✅ Se extrae con `URLSearchParams(hash.substring(1))`
3. ✅ Se valida que `type === 'recovery'`
4. ✅ Se establece sesión con `supabase.auth.setSession()`
5. ✅ Usuario actualiza contraseña con `supabase.auth.updateUser()`
6. ✅ Se cierra sesión automáticamente
7. ✅ Se redirige a login

---

**Documentado:** 2025-10-20  
**Autor:** Sistema de Recuperación de Contraseña Evently  
**Versión:** 1.0
