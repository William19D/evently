# 📚 Guía para Escribir Tests Personalizados con Cypress

Esta guía te ayudará a crear tus propios tests de Cypress para nuevas funcionalidades en Evently.

## 🎯 Estructura Básica de un Test

```typescript
/// <reference types="cypress" />

describe('Nombre del Feature', () => {
  beforeEach(() => {
    // Se ejecuta antes de cada test
    cy.visit('/ruta-de-la-pagina');
    cy.bypassRecaptcha(); // Si la página usa reCAPTCHA
  });

  it('debe hacer algo específico', () => {
    // Aquí va el código del test
  });
});
```

## 📝 Ejemplos Prácticos

### Ejemplo 1: Test de Formulario Básico

```typescript
describe('Formulario de Contacto', () => {
  beforeEach(() => {
    cy.visit('/contact');
  });

  it('debe enviar el formulario con datos válidos', () => {
    // Llenar campos
    cy.get('#name').type('Juan Pérez');
    cy.get('#email').type('juan@example.com');
    cy.get('#message').type('Este es un mensaje de prueba');

    // Enviar formulario
    cy.get('button[type="submit"]').click();

    // Verificar éxito
    cy.contains('Mensaje enviado').should('be.visible');
  });

  it('debe validar email inválido', () => {
    cy.get('#email').type('email-invalido');
    cy.get('button[type="submit"]').click();
    
    cy.contains('email válido').should('be.visible');
  });
});
```

### Ejemplo 2: Test con Interceptación de API

```typescript
describe('Lista de Espacios', () => {
  it('debe cargar espacios desde la API', () => {
    // Interceptar la llamada a la API
    cy.intercept('GET', '**/api/spaces**', {
      statusCode: 200,
      body: {
        spaces: [
          { id: 1, name: 'Espacio 1', capacity: 100 },
          { id: 2, name: 'Espacio 2', capacity: 50 },
        ],
      },
    }).as('getSpaces');

    cy.visit('/spaces');

    // Esperar a que se complete la llamada
    cy.wait('@getSpaces');

    // Verificar que los espacios se muestren
    cy.contains('Espacio 1').should('be.visible');
    cy.contains('Espacio 2').should('be.visible');
  });

  it('debe manejar error de carga', () => {
    cy.intercept('GET', '**/api/spaces**', {
      statusCode: 500,
      body: { error: 'Server error' },
    }).as('getSpacesError');

    cy.visit('/spaces');
    cy.wait('@getSpacesError');

    cy.contains(/error|problema/i).should('be.visible');
  });
});
```

### Ejemplo 3: Test de Navegación

```typescript
describe('Navegación Principal', () => {
  it('debe navegar entre páginas principales', () => {
    cy.visit('/');
    
    // Verificar que estamos en home
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // Navegar a About
    cy.contains('Nosotros').click();
    cy.url().should('include', '/about');

    // Navegar a Contact
    cy.contains('Contacto').click();
    cy.url().should('include', '/contact');
  });
});
```

### Ejemplo 4: Test con Autenticación

```typescript
describe('Dashboard de Usuario', () => {
  beforeEach(() => {
    // Usar comando personalizado para login
    cy.loginAsClient('test@example.com', 'password123');
  });

  it('debe mostrar el dashboard después del login', () => {
    cy.url().should('include', '/dashboard');
    cy.contains('Bienvenido').should('be.visible');
  });

  it('debe permitir cerrar sesión', () => {
    cy.visit('/dashboard');
    
    cy.get('[data-testid="user-menu"]').click();
    cy.contains('Cerrar Sesión').click();

    // Verificar redirección a home
    cy.url().should('not.include', '/dashboard');
  });
});
```

### Ejemplo 5: Test Responsive

```typescript
describe('Responsive - Mobile', () => {
  const viewports = [
    { device: 'iPhone 6', width: 375, height: 667 },
    { device: 'iPad', width: 768, height: 1024 },
  ];

  viewports.forEach((viewport) => {
    it(`debe funcionar en ${viewport.device}`, () => {
      cy.viewport(viewport.width, viewport.height);
      cy.visit('/');

      // Verificar menú hamburguesa en mobile
      if (viewport.width < 768) {
        cy.get('[data-testid="mobile-menu"]').should('be.visible');
      }

      // Verificar contenido principal
      cy.contains('Evently').should('be.visible');
    });
  });
});
```

### Ejemplo 6: Test de Búsqueda

```typescript
describe('Búsqueda de Espacios', () => {
  it('debe buscar espacios por nombre', () => {
    cy.visit('/spaces');

    // Escribir en el campo de búsqueda
    cy.get('[data-testid="search-input"]').type('Salón');

    // Verificar resultados filtrados
    cy.contains('Salón de Eventos').should('be.visible');
    cy.contains('Espacio Deportivo').should('not.exist');
  });

  it('debe mostrar mensaje cuando no hay resultados', () => {
    cy.visit('/spaces');

    cy.get('[data-testid="search-input"]').type('XYZ123NOEXISTE');

    cy.contains('No se encontraron resultados').should('be.visible');
  });
});
```

### Ejemplo 7: Test de Subida de Archivos

```typescript
describe('Subida de Imágenes', () => {
  it('debe subir una imagen de perfil', () => {
    cy.visit('/profile/edit');

    // Crear un archivo de prueba
    const fileName = 'test-image.jpg';
    cy.fixture(fileName, 'base64').then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent,
        fileName,
        mimeType: 'image/jpeg',
        encoding: 'base64',
      });
    });

    cy.contains('Imagen subida').should('be.visible');
  });
});
```

## 🛠️ Comandos Útiles de Cypress

### Selección de Elementos

```typescript
// Por ID
cy.get('#email')

// Por clase
cy.get('.btn-primary')

// Por atributo
cy.get('[data-testid="submit-button"]')

// Por tipo
cy.get('input[type="email"]')

// Por texto
cy.contains('Iniciar Sesión')

// Combinados
cy.get('button').contains('Enviar')

// Primer/último elemento
cy.get('li').first()
cy.get('li').last()

// Por índice
cy.get('li').eq(2)
```

### Interacciones

```typescript
// Click
cy.get('button').click()

// Doble click
cy.get('button').dblclick()

// Click derecho
cy.get('button').rightclick()

// Type (escribir)
cy.get('input').type('Texto')

// Limpiar y escribir
cy.get('input').clear().type('Nuevo texto')

// Seleccionar opción
cy.get('select').select('Opción 1')

// Marcar checkbox
cy.get('input[type="checkbox"]').check()
cy.get('input[type="checkbox"]').uncheck()

// Hover (no nativo, pero se puede simular)
cy.get('button').trigger('mouseover')
```

### Aserciones (Verificaciones)

```typescript
// Visible
cy.get('h1').should('be.visible')
cy.get('h1').should('not.be.visible')

// Existir
cy.get('.error').should('exist')
cy.get('.error').should('not.exist')

// Tener texto
cy.get('h1').should('have.text', 'Bienvenido')
cy.get('h1').should('contain', 'Bien')

// Tener clase
cy.get('button').should('have.class', 'active')

// Estar disabled
cy.get('button').should('be.disabled')
cy.get('button').should('not.be.disabled')

// Tener valor
cy.get('input').should('have.value', 'test@example.com')

// URL
cy.url().should('include', '/dashboard')
cy.url().should('eq', 'http://localhost:8080/login')

// Múltiples aserciones
cy.get('button')
  .should('be.visible')
  .and('have.class', 'btn-primary')
  .and('not.be.disabled')
```

### Esperas y Tiempos

```typescript
// Esperar elemento
cy.get('.loader', { timeout: 10000 }).should('be.visible')

// Esperar petición
cy.wait('@apiCall')

// Esperar múltiples peticiones
cy.wait(['@getUser', '@getSpaces'])

// Esperar tiempo fijo (evitar si es posible)
cy.wait(1000)
```

## 🎨 Mejores Prácticas

### 1. Usa data-testid para selectores estables

```html
<!-- En tu componente -->
<button data-testid="submit-button">Enviar</button>
```

```typescript
// En tu test
cy.get('[data-testid="submit-button"]').click()
```

### 2. Agrupa tests relacionados

```typescript
describe('User Profile', () => {
  describe('Personal Information', () => {
    it('should update name', () => { /* ... */ })
    it('should update email', () => { /* ... */ })
  })

  describe('Password Management', () => {
    it('should change password', () => { /* ... */ })
  })
})
```

### 3. Usa beforeEach para setup común

```typescript
describe('Tests', () => {
  beforeEach(() => {
    cy.visit('/page')
    cy.loginAsClient('test@example.com', 'password')
  })

  it('test 1', () => { /* ... */ })
  it('test 2', () => { /* ... */ })
})
```

### 4. Intercepta APIs para tests predecibles

```typescript
cy.intercept('POST', '/api/login', {
  statusCode: 200,
  body: { token: 'fake-token' }
}).as('login')
```

### 5. Nombra tus tests claramente

```typescript
// ❌ Mal
it('works', () => { /* ... */ })

// ✅ Bien
it('debe mostrar error cuando el email es inválido', () => { /* ... */ })
```

### 6. Limpia el estado entre tests

```typescript
beforeEach(() => {
  cy.clearLocalStorage()
  cy.clearCookies()
})
```

## 🚫 Anti-Patrones (Qué Evitar)

### ❌ No usar selectores frágiles

```typescript
// Mal - puede romperse fácilmente
cy.get('div > div > button:nth-child(3)')

// Bien
cy.get('[data-testid="submit-button"]')
```

### ❌ No hardcodear esperas

```typescript
// Mal
cy.wait(5000)

// Bien
cy.wait('@apiCall')
cy.get('.loaded-content').should('be.visible')
```

### ❌ No testear implementación, testea comportamiento

```typescript
// Mal
cy.get('.component').should('have.class', 'component-internal-class-v2')

// Bien
cy.get('.component').should('be.visible')
cy.contains('Expected Text').should('exist')
```

### ❌ No crear tests dependientes entre sí

```typescript
// Mal - test 2 depende de test 1
it('test 1 - creates user', () => { /* creates user */ })
it('test 2 - logs in', () => { /* assumes user exists */ })

// Bien - cada test es independiente
it('test 1 - creates user', () => { /* creates and cleans up */ })
it('test 2 - logs in', () => { /* creates user, logs in, cleans up */ })
```

## 📚 Recursos Adicionales

- [Documentación oficial de Cypress](https://docs.cypress.io/)
- [Best Practices de Cypress](https://docs.cypress.io/guides/references/best-practices)
- [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app) - Ejemplos reales

## 💡 Tips Finales

1. **Ejecuta tests frecuentemente** durante el desarrollo
2. **Usa el modo interactivo** para debugging
3. **Intercepta APIs** para evitar dependencias externas
4. **Mantén tests simples** y enfocados en un comportamiento
5. **Documenta tests complejos** con comentarios
6. **Revisa screenshots** de errores para debugging rápido

---

¡Feliz testing! 🎉
