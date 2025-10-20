/// <reference types="cypress" />

declare namespace Cypress {
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
