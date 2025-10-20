# 🚀 Quick Start - Tests de Cypress

## Inicio Rápido en 3 Pasos

### 1️⃣ Asegúrate de tener la aplicación corriendo

```bash
npm run dev
```

La aplicación debe estar corriendo en `http://localhost:8080`

### 2️⃣ Abre Cypress

```bash
npm run cypress:open
```

O usando el script de PowerShell:
```powershell
.\run-tests.ps1
```

### 3️⃣ Selecciona y ejecuta los tests

1. En la ventana de Cypress, selecciona **E2E Testing**
2. Elige tu navegador preferido (Chrome recomendado)
3. Haz clic en cualquier archivo de test:
   - `client-login.cy.ts` - Tests de Login
   - `client-register.cy.ts` - Tests de Registro
   - `auth-flow.cy.ts` - Tests de Flujo Completo

## 📊 Ver Resultados

Los tests se ejecutarán automáticamente y verás:
- ✅ Tests que pasan en verde
- ❌ Tests que fallan en rojo
- ⏱️ Tiempo de ejecución
- 📸 Screenshots de errores (si hay)

## 🎯 Ejecutar Tests en Modo Headless

Para CI/CD o ejecución rápida sin UI:

```bash
npm run test:e2e
```

## 🐛 Debugging

Si un test falla:

1. **Modo interactivo**: Pausar y ver el DOM en tiempo real
2. **Time travel**: Volver a cualquier paso del test
3. **Console logs**: Ver logs de consola de la app
4. **Screenshots**: Revisar en `cypress/screenshots/`

## 📝 Crear Nuevos Tests

1. Crea un archivo en `cypress/e2e/` con extensión `.cy.ts`
2. Usa los ejemplos en `cypress/GUIDE.md`
3. Ejecuta y verifica

## ❓ Troubleshooting

### La app no corre en localhost:8080

**Solución**: Ejecuta `npm run dev` en otra terminal

### Cypress no se abre

**Solución**: 
```bash
npm install
npm run cypress:open
```

### Tests fallan por reCAPTCHA

**Solución**: Los tests ya incluyen bypass de reCAPTCHA con `cy.bypassRecaptcha()`

### Error de timeout

**Solución**: Aumenta el timeout en `cypress.config.ts`:
```typescript
defaultCommandTimeout: 10000
```

## 🎓 Siguiente Paso

Lee la documentación completa en:
- `cypress/README.md` - Documentación detallada
- `cypress/GUIDE.md` - Guía de creación de tests
- `CYPRESS_IMPLEMENTATION.md` - Detalles de implementación

---

**¿Listo para testear?** 🧪

```bash
npm run cypress:open
```
