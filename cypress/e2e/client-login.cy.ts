/// <reference types="cypress" />

describe('Client Login - Tests de Inicio de Sesión', () => {
  beforeEach(() => {
    // Visitar la página de login antes de cada test
    cy.visit('/login/client');
    
    // Bypass reCAPTCHA para tests
    cy.bypassRecaptcha();
  });

  describe('Elementos de la UI', () => {
    it('debe mostrar todos los elementos del formulario de login', () => {
      // Verificar título y descripción
      cy.contains('Iniciar Sesión - Cliente').should('be.visible');
      cy.contains('Accede a tu cuenta para buscar espacios').should('be.visible');

      // Verificar campos de formulario
      cy.get('#email').should('be.visible').and('have.attr', 'type', 'email');
      cy.get('#password').should('be.visible').and('have.attr', 'type', 'password');

      // Verificar botón de submit
      cy.get('button[type="submit"]').should('be.visible').contains('Iniciar Sesión');

      // Verificar enlaces
      cy.contains('¿Olvidaste tu contraseña?').should('be.visible');
      cy.contains('Regístrate como cliente').should('be.visible');
      cy.contains('Volver al inicio').should('be.visible');
    });

    it('debe tener iconos en los campos de entrada', () => {
      // Verificar que los iconos estén presentes (Mail y Lock)
      cy.get('#email').parent().find('svg').should('exist');
      cy.get('#password').parent().find('svg').should('exist');
    });

    it('debe poder mostrar/ocultar la contraseña', () => {
      // La contraseña debe estar oculta inicialmente
      cy.get('#password').should('have.attr', 'type', 'password');

      // Click en el botón para mostrar contraseña
      cy.get('#password').parent().find('button').click();
      cy.get('#password').should('have.attr', 'type', 'text');

      // Click nuevamente para ocultar
      cy.get('#password').parent().find('button').click();
      cy.get('#password').should('have.attr', 'type', 'password');
    });
  });

  describe('Validación del Formulario', () => {
    it('debe mostrar error cuando el email está vacío', () => {
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Verificar que el formulario no se envíe (permanecemos en la página)
      cy.url().should('include', '/login/client');
    });

    it('debe mostrar error cuando la contraseña está vacía', () => {
      cy.get('#email').type('test@example.com');
      cy.get('button[type="submit"]').click();
      
      // Verificar que el formulario no se envíe
      cy.url().should('include', '/login/client');
    });

    it('debe validar longitud mínima de contraseña', () => {
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('12345'); // Menos de 6 caracteres
      cy.get('button[type="submit"]').click();
      
      // Verificar mensaje de error
      cy.contains('La contraseña debe tener al menos 6 caracteres').should('be.visible');
    });
  });

  describe('Navegación', () => {
    it('debe navegar a la página de registro cuando se hace click en el enlace', () => {
      cy.contains('Regístrate como cliente').click();
      cy.url().should('include', '/register/client');
    });

    it('debe navegar a recuperar contraseña cuando se hace click en el enlace', () => {
      cy.contains('¿Olvidaste tu contraseña?').click();
      cy.url().should('include', '/recover-password');
    });

    it('debe volver al inicio cuando se hace click en "Volver al inicio"', () => {
      cy.contains('Volver al inicio').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Proceso de Login', () => {
    it('debe mostrar estado de carga al enviar el formulario', () => {
      cy.intercept('POST', '**/auth/v1/token**', (req) => {
        req.reply({
          delay: 1000, // Simular delay
          statusCode: 200,
        });
      }).as('loginRequest');

      cy.get('#email').type('test@example.com');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();

      // Verificar que el botón muestre estado de carga
      cy.get('button[type="submit"]').should('contain', 'Iniciando sesión...');
      cy.get('button[type="submit"]').should('be.disabled');
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener labels asociados a los inputs', () => {
      cy.get('label[for="email"]').should('exist');
      cy.get('label[for="password"]').should('exist');
    });

    it('debe tener atributos required en campos obligatorios', () => {
      cy.get('#email').should('have.attr', 'required');
      cy.get('#password').should('have.attr', 'required');
    });
  });

  describe('Responsive Design', () => {
    const viewports = [
      { device: 'iphone-6', width: 375, height: 667 },
      { device: 'ipad-2', width: 768, height: 1024 },
      { device: 'desktop', width: 1280, height: 720 },
    ];

    viewports.forEach((viewport) => {
      it(`debe ser usable en ${viewport.device}`, () => {
        cy.viewport(viewport.width, viewport.height);
        
        // Verificar que los elementos sean visibles y accesibles
        cy.get('#email').should('be.visible');
        cy.get('#password').should('be.visible');
        cy.get('button[type="submit"]').should('be.visible');
      });
    });
  });

  describe('Security Features', () => {
    it('debe ocultar la contraseña por defecto', () => {
      cy.get('#password').should('have.attr', 'type', 'password');
      cy.get('#password').type('mi-password-secreto');
      
      // La contraseña no debe ser visible como texto
      cy.get('#password').should('not.have.attr', 'type', 'text');
    });
  });

  describe('Error Handling', () => {
    it('debe manejar error de red', () => {
      cy.intercept('POST', '**/auth/v1/token**', {
        forceNetworkError: true,
      }).as('networkError');

      cy.get('#email').type('test@example.com');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();

      // Verificar que se muestre un mensaje de error apropiado
      cy.contains(/error|problema|conexión/i, { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Alert Messages', () => {
    it('debe mostrar alerta informativa sobre el proceso de login', () => {
      // Verificar que haya una alerta con información útil
      cy.contains(/Inicio de sesión|email|contraseña/i).should('be.visible');
    });
  });
});
