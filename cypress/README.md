# Tests E2E con Cypress - Evently

Este proyecto incluye tests end-to-end (E2E) usando Cypress para las funcionalidades de Login y Registro de clientes.

## 📋 Tabla de Contenidos

- [Instalación](#instalación)
- [Ejecutar Tests](#ejecutar-tests)
- [Estructura de Tests](#estructura-de-tests)
- [Tests Implementados](#tests-implementados)
- [Comandos Personalizados](#comandos-personalizados)
- [Configuración](#configuración)

## 🚀 Instalación

Los paquetes de Cypress ya están instalados. Si necesitas reinstalar:

```bash
npm install --save-dev cypress @testing-library/cypress
```

## ▶️ Ejecutar Tests

### Modo Interactivo (Recomendado para desarrollo)

Abre la interfaz de Cypress para ejecutar tests visualmente:

```bash
npm run cypress:open
# o
npm run test:e2e:ui
```

### Modo Headless (Para CI/CD)

Ejecuta todos los tests en modo headless:

```bash
npm run cypress:run
# o
npm run test:e2e
```

### Ejecutar un test específico

```bash
npx cypress run --spec "cypress/e2e/client-login.cy.ts"
npx cypress run --spec "cypress/e2e/client-register.cy.ts"
```

## 📁 Estructura de Tests

```
cypress/
├── e2e/                          # Tests E2E
│   ├── client-login.cy.ts        # Tests de Login
│   └── client-register.cy.ts     # Tests de Registro
├── fixtures/                     # Datos de prueba
│   └── users.json                # Usuarios y mensajes de prueba
├── support/                      # Configuración y comandos
│   ├── commands.ts               # Comandos personalizados
│   ├── e2e.ts                    # Configuración global
│   └── index.d.ts                # Tipos TypeScript
└── cypress.config.ts             # Configuración de Cypress
```

## ✅ Tests Implementados

### Login Tests (`client-login.cy.ts`)

**Elementos de la UI:**
- ✅ Verificación de todos los elementos del formulario
- ✅ Iconos en campos de entrada
- ✅ Toggle de visibilidad de contraseña

**Validación del Formulario:**
- ✅ Email vacío
- ✅ Contraseña vacía
- ✅ Formato de email inválido
- ✅ Longitud mínima de contraseña

**Navegación:**
- ✅ Link a registro
- ✅ Link a recuperar contraseña
- ✅ Botón volver al inicio

**Proceso de Login:**
- ✅ Estado de carga
- ✅ Error de credenciales incorrectas
- ✅ Limpieza de errores al escribir

**Accesibilidad:**
- ✅ Labels asociados a inputs
- ✅ Navegación con teclado
- ✅ Atributos required

**Responsive Design:**
- ✅ iPhone 6 (375x667)
- ✅ iPad 2 (768x1024)
- ✅ Desktop (1280x720)

**Seguridad:**
- ✅ Badge de reCAPTCHA
- ✅ Contraseña oculta por defecto

**Manejo de Errores:**
- ✅ Error de red
- ✅ Timeout del servidor
- ✅ Alertas de error visibles

### Register Tests (`client-register.cy.ts`)

**Elementos de la UI:**
- ✅ Todos los campos del formulario
- ✅ Enlaces a términos y privacidad
- ✅ Toggle de visibilidad de contraseñas
- ✅ Iconos en campos

**Validación del Formulario:**
- ✅ Nombre requerido
- ✅ Apellido requerido
- ✅ Email válido
- ✅ Teléfono (10 dígitos)
- ✅ Contraseña mínima 6 caracteres
- ✅ Contraseñas coinciden
- ✅ Aceptación de términos

**Navegación:**
- ✅ Link a login
- ✅ Cambiar tipo de usuario
- ✅ Enlaces a términos y privacidad

**Proceso de Registro:**
- ✅ Completar formulario válido
- ✅ Estado de carga
- ✅ Error de email duplicado
- ✅ Pantalla de confirmación de email

**Accesibilidad:**
- ✅ Labels para todos los campos
- ✅ Atributos required
- ✅ Placeholders descriptivos

**Responsive Design:**
- ✅ iPhone 6, iPad 2, Desktop

**Seguridad:**
- ✅ reCAPTCHA
- ✅ Contraseñas ocultas
- ✅ Minlength en contraseña

**Manejo de Errores:**
- ✅ Error de red
- ✅ Alertas de validación

**Interacción del Formulario:**
- ✅ Copiar y pegar
- ✅ Limpiar campos

## 🛠️ Comandos Personalizados

### `cy.loginAsClient(email, password)`

Inicia sesión como cliente:

```typescript
cy.loginAsClient('test@example.com', 'password123');
```

### `cy.registerClient(data)`

Registra un nuevo cliente:

```typescript
cy.registerClient({
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@example.com',
  phone: '3167894567',
  password: 'Password123!'
});
```

### `cy.bypassRecaptcha()`

Bypasea reCAPTCHA para tests:

```typescript
cy.bypassRecaptcha();
```

## ⚙️ Configuración

### Variables de Entorno

Edita `cypress.config.ts` para configurar:

```typescript
env: {
  testEmail: "test@example.com",
  testPassword: "TestPassword123!",
}
```

### Base URL

Por defecto apunta a `http://localhost:8080`. Cambia en `cypress.config.ts`:

```typescript
baseUrl: "http://localhost:8080"
```

## 📊 Cobertura de Tests

Los tests cubren:

- ✅ **Validación de formularios** - Todos los campos y reglas
- ✅ **Navegación** - Todos los links y rutas
- ✅ **Estados de carga** - Botones disabled y texto de carga
- ✅ **Manejo de errores** - Red, servidor, validación
- ✅ **Accesibilidad** - ARIA, labels, navegación por teclado
- ✅ **Responsive** - Mobile, tablet, desktop
- ✅ **Seguridad** - reCAPTCHA, contraseñas ocultas

## 🐛 Debugging

### Ver tests en modo interactivo

```bash
npm run cypress:open
```

Esto te permite:
- Ver la aplicación mientras se ejecutan los tests
- Pausar tests en cualquier momento
- Inspeccionar el DOM
- Ver logs de consola

### Screenshots

Los screenshots de errores se guardan automáticamente en:
```
cypress/screenshots/
```

### Videos (deshabilitados por defecto)

Para habilitar videos, edita `cypress.config.ts`:

```typescript
video: true
```

## 📝 Buenas Prácticas

1. **Usa data-testid** para selectores estables:
   ```html
   <button data-testid="submit-button">Submit</button>
   ```
   ```typescript
   cy.get('[data-testid="submit-button"]').click();
   ```

2. **Intercepta llamadas API** para tests predecibles:
   ```typescript
   cy.intercept('POST', '**/auth/v1/signup**', {
     statusCode: 200,
     body: { success: true }
   }).as('register');
   ```

3. **Limpia el estado** entre tests:
   ```typescript
   beforeEach(() => {
     cy.clearLocalStorage();
     cy.clearCookies();
   });
   ```

## 🔗 Recursos

- [Documentación de Cypress](https://docs.cypress.io/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Testing Library](https://testing-library.com/docs/cypress-testing-library/intro/)

## 🤝 Contribuir

Para agregar nuevos tests:

1. Crea un archivo en `cypress/e2e/` con extensión `.cy.ts`
2. Sigue la estructura de los tests existentes
3. Usa comandos personalizados cuando sea posible
4. Documenta los tests con comentarios claros
5. Ejecuta los tests localmente antes de hacer commit

---

**Nota:** Asegúrate de que la aplicación esté corriendo (`npm run dev`) antes de ejecutar los tests.
