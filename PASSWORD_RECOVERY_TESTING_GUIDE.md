# 🧪 GUÍA DE TESTING - Recuperación de Contraseña

## ⚡ Prueba Rápida

### 1️⃣ Solicitar Recuperación
```
1. Ir a: http://localhost:5173/recover-password
2. Ingresar email registrado
3. Click en "Enviar enlace"
4. ✅ Debería mostrar: "Revisa tu Email"
```

### 2️⃣ Verificar Email
```
1. Abrir tu bandeja de entrada
2. Buscar email de "Evently Seguridad"
3. ✅ Debería ver email con diseño profesional
```

### 3️⃣ Click en Enlace (PUNTO CRÍTICO)
```
1. Click en botón "Restablecer Contraseña" del email
2. ✅ DEBE abrir: http://localhost:5173/reset-password#access_token=...&type=recovery
3. ❌ NO DEBE: Redirigir al dashboard
4. ❌ NO DEBE: Mostrar mensaje de "Login exitoso"
```

### 4️⃣ Verificar Consola del Navegador
```
Abre DevTools (F12) → Console

LOGS ESPERADOS:
✅ 🔐 useEmailVerificationHandler: Recovery token detected, skipping handler
✅ 🔍 Validating recovery token...
✅ Token type: recovery
✅ Has access token: true
✅ ✅ Valid recovery token detected
✅ ✅ Session established successfully

LOGS NO DESEADOS (si aparecen, hay problema):
❌ 🔄 useEmailVerificationHandler: Detected callback URL
❌ ✅ useEmailVerificationHandler: Session found
❌ 🔄 useEmailVerificationHandler: Redirecting user
```

### 5️⃣ Verificar UI
```
DEBE MOSTRAR:
✅ Título: "Nueva Contraseña"
✅ Campo: "Nueva Contraseña"
✅ Campo: "Confirmar Contraseña"
✅ Botón mostrar/ocultar contraseña (👁️)
✅ Indicador de seguridad
✅ Lista de requisitos
✅ Botón "Actualizar Contraseña"

NO DEBE MOSTRAR:
❌ Dashboard
❌ Mensaje de "Login exitoso"
❌ Navegación del usuario logueado
```

### 6️⃣ Ingresar Nueva Contraseña
```
1. Nueva Contraseña: TestPass123!@#
2. Confirmar: TestPass123!@#
3. ✅ Indicador debería mostrar "Muy Fuerte" en verde
4. ✅ Todos los requisitos en verde (✓)
5. Click en "Actualizar Contraseña"
```

### 7️⃣ Verificar Éxito
```
DEBE MOSTRAR:
✅ Título: "¡Contraseña Actualizada!"
✅ Mensaje de éxito
✅ Redirige a login automáticamente (3 segundos)

LUEGO:
✅ Puede iniciar sesión con nueva contraseña
✅ NO puede usar la contraseña antigua
```

---

## 🐛 Si el problema persiste

### Síntoma: Todavía redirige al dashboard

1. **Verificar que el cambio se aplicó:**
   ```bash
   # Abrir archivo
   src/hooks/use-email-verification.ts
   
   # Buscar estas líneas (deben existir):
   const tokenType = hashParams.get('type');
   if (tokenType === 'recovery') {
     console.log('🔐 Recovery token detected, skipping handler');
     return;
   }
   ```

2. **Limpiar caché del navegador:**
   ```
   Ctrl + Shift + R (Windows)
   Cmd + Shift + R (Mac)
   ```

3. **Verificar que el servidor está actualizado:**
   ```bash
   # En terminal, detener el servidor (Ctrl+C)
   # Reiniciar
   npm run dev
   # o
   bun dev
   ```

4. **Verificar en modo incógnito:**
   ```
   Ctrl + Shift + N (Chrome)
   Ctrl + Shift + P (Firefox)
   ```

### Síntoma: Dice "Enlace Inválido o Expirado"

1. **Verificar URL del enlace:**
   ```
   DEBE tener: #access_token=...&type=recovery
   NO debe tener: ?access_token=...
   ```

2. **Verificar en consola:**
   ```javascript
   // En DevTools Console, pegar:
   console.log(window.location.hash);
   
   // DEBE mostrar algo como:
   #access_token=eyJhbG...&type=recovery&refresh_token=...
   ```

3. **Verificar que el token no expiró:**
   ```
   Los tokens expiran en 1 hora
   Si pasó más tiempo, solicitar nuevo enlace
   ```

### Síntoma: No recibo el email

1. **Verificar carpeta spam**
2. **Verificar que el email existe en Supabase**
3. **Verificar que el email está confirmado**
4. **Verificar logs de la Edge Function en Supabase**

---

## 📋 Checklist de Verificación

Marca cada item que funciona correctamente:

- [ ] Página `/recover-password` carga correctamente
- [ ] Puedo ingresar email y enviar
- [ ] Veo pantalla de confirmación "Revisa tu Email"
- [ ] Recibo el email en mi bandeja
- [ ] El email tiene diseño profesional
- [ ] Click en botón del email abre `/reset-password`
- [ ] **CRÍTICO:** NO redirige al dashboard
- [ ] **CRÍTICO:** NO muestra "Login exitoso"
- [ ] Veo formulario de nueva contraseña
- [ ] Indicador de fortaleza funciona
- [ ] Requisitos se marcan en verde al cumplir
- [ ] Puedo actualizar la contraseña
- [ ] Veo mensaje "¡Contraseña Actualizada!"
- [ ] Redirige a login automáticamente
- [ ] Puedo iniciar sesión con nueva contraseña
- [ ] El enlace ya NO funciona (uso único)

---

## 🔍 Debugging Avanzado

### Inspeccionar el enlace del email

```javascript
// Copiar la URL completa del enlace
// Pegar en consola del navegador:

const url = "PEGAR_AQUI_LA_URL_COMPLETA";
const urlObj = new URL(url);
const hash = urlObj.hash;
const hashParams = new URLSearchParams(hash.substring(1));

console.log({
  fullUrl: url,
  pathname: urlObj.pathname,
  hash: hash,
  accessToken: hashParams.get('access_token')?.substring(0, 20) + '...',
  type: hashParams.get('type'),
  refreshToken: hashParams.get('refresh_token')?.substring(0, 20) + '...',
});

// RESULTADO ESPERADO:
// {
//   fullUrl: "https://app.evently.blog/reset-password#access_token=...",
//   pathname: "/reset-password",
//   hash: "#access_token=...&type=recovery&refresh_token=...",
//   accessToken: "eyJhbG...",
//   type: "recovery",
//   refreshToken: "v1.MR..."
// }
```

### Verificar que EmailVerificationHandler no intercepta

```javascript
// En la página de reset-password, en consola:

// 1. Verificar token type
const hash = window.location.hash;
const hashParams = new URLSearchParams(hash.substring(1));
console.log('Token type:', hashParams.get('type')); // DEBE ser "recovery"

// 2. Verificar pathname
console.log('Current path:', window.location.pathname); // DEBE ser "/reset-password"

// 3. Verificar sesión
const { data: { session } } = await supabase.auth.getSession();
console.log('Has session:', !!session);
console.log('User email:', session?.user?.email);
```

---

## 💡 Notas Importantes

1. **El fix ya está implementado** en `use-email-verification.ts`
2. **Debes reiniciar el servidor** después de los cambios
3. **Limpia el caché** del navegador
4. **Usa modo incógnito** para testing limpio
5. **Revisa la consola** para ver los logs

---

**Última actualización:** 2025-10-20  
**Status:** ✅ Fix implementado - Listo para testing
