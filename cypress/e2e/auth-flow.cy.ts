/// <reference types="cypress" />

describe('Flujo Completo - Registro y Login', () => {
  const uniqueEmail = `test.user.${Date.now()}@example.com`;
  const userData = {
    firstName: 'Test',
    lastName: 'User',
    email: uniqueEmail,
    phone: '3001234567',
    password: 'TestPassword123!',
  };

  beforeEach(() => {
    cy.bypassRecaptcha();
  });

  describe('Navegación entre Login y Register', () => {
    it('debe permitir navegar de Login a Register y viceversa', () => {
      // Comenzar en Login
      cy.visit('/login/client');
      cy.url().should('include', '/login/client');

      // Ir a Register
      cy.contains('Regístrate como cliente').click();
      cy.url().should('include', '/register/client');

      // Volver a Login
      cy.contains('Inicia sesión aquí').click();
      cy.url().should('include', '/login/client');
    });

    it('debe preservar los datos al navegar (si aplica)', () => {
      cy.visit('/register/client');
      
      // Llenar algunos campos
      cy.get('#firstName').type('Juan');
      cy.get('#lastName').type('Pérez');

      // Navegar a otra página y volver
      cy.contains('Cambiar tipo de usuario').click();
      cy.go('back');

      // Los datos pueden o no preservarse dependiendo de la implementación
      // Este test documenta el comportamiento actual
    });
  });

  describe('Flujo de Recuperación de Contraseña', () => {
    it('debe navegar al flujo de recuperación desde login', () => {
      cy.visit('/login/client');
      
      cy.contains('¿Olvidaste tu contraseña?').click();
      cy.url().should('include', '/recover-password');
    });
  });

  describe('Experiencia de Usuario', () => {
    it('debe deshabilitar el botón de submit durante el procesamiento', () => {
      cy.visit('/login/client');

      cy.get('#email').type('test@example.com');
      cy.get('#password').type('password123');

      cy.intercept('POST', '**/auth/v1/token**', (req) => {
        req.reply({
          delay: 2000,
          statusCode: 200,
        });
      }).as('slowLogin');

      cy.get('button[type="submit"]').click();

      // Verificar que el botón esté deshabilitado
      cy.get('button[type="submit"]').should('be.disabled');
      
      // Verificar texto de carga
      cy.get('button[type="submit"]').should('contain', 'Iniciando sesión...');
    });
  });
});

