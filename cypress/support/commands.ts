/// <reference types="cypress" />

// ***********************************************
// Custom commands for reusable test logic
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login as a client
       * @example cy.loginAsClient('test@example.com', 'password123')
       */
      loginAsClient(email: string, password: string): Chainable<void>;
      
      /**
       * Custom command to register a new client
       * @example cy.registerClient({ firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '1234567890', password: 'password123' })
       */
      registerClient(data: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        password: string;
      }): Chainable<void>;

      /**
       * Custom command to bypass reCAPTCHA in tests
       * @example cy.bypassRecaptcha()
       */
      bypassRecaptcha(): Chainable<void>;
    }
  }
}

// Comando para hacer login
Cypress.Commands.add('loginAsClient', (email: string, password: string) => {
  cy.visit('/login/client');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
});

// Comando para registrarse
Cypress.Commands.add('registerClient', (data) => {
  cy.visit('/register/client');
  cy.get('#firstName').type(data.firstName);
  cy.get('#lastName').type(data.lastName);
  cy.get('#email').type(data.email);
  cy.get('#phone').type(data.phone);
  cy.get('#password').type(data.password);
  cy.get('#confirmPassword').type(data.password);
  cy.get('#terms').check();
  cy.get('button[type="submit"]').click();
});

// Comando para bypassear reCAPTCHA en tests
Cypress.Commands.add('bypassRecaptcha', () => {
  // Interceptar las llamadas a reCAPTCHA y mockearlas
  cy.window().then((win) => {
    // Mock grecaptcha object
    (win as any).grecaptcha = {
      ready: (callback: () => void) => callback(),
      execute: () => Promise.resolve('test-recaptcha-token'),
      render: () => {},
    };
  });
});

export {};
