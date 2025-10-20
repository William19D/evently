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
       * Custom command to login as an owner
       * @example cy.loginAsOwner('owner@example.com', 'password123')
       */
      loginAsOwner(email: string, password: string): Chainable<void>;
      
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

      /**
       * Custom command to mock space creation API
       * @example cy.mockCreateSpace()
       */
      mockCreateSpace(): Chainable<void>;

      /**
       * Custom command to mock reservation creation API
       * @example cy.mockCreateReservation()
       */
      mockCreateReservation(): Chainable<void>;

      /**
       * Custom command to set authentication tokens for owner
       * @example cy.setOwnerAuth()
       */
      setOwnerAuth(): Chainable<void>;

      /**
       * Custom command to set authentication tokens for client
       * @example cy.setClientAuth()
       */
      setClientAuth(): Chainable<void>;
    }
  }
}

// Comando para hacer login como cliente
Cypress.Commands.add('loginAsClient', (email: string, password: string) => {
  cy.visit('/login/client');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
});

// Comando para hacer login como owner
Cypress.Commands.add('loginAsOwner', (email: string, password: string) => {
  cy.visit('/login/owner');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
});

// Comando para registrarse como cliente
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

// Comando para mockear la creación de espacios
Cypress.Commands.add('mockCreateSpace', () => {
  cy.intercept('POST', '**/functions/v1/space', {
    statusCode: 200,
    body: {
      success: true,
      data: {
        id_space: Math.floor(Math.random() * 10000),
        space_name: 'Espacio de Prueba',
        space_type: 'salon_eventos',
        max_capacity: 100,
        price_per_hour: 50000,
        location: 'Bogotá, Colombia',
        description: 'Espacio creado en test',
        status: 'pending',
        created_at: new Date().toISOString()
      }
    }
  }).as('createSpace');
});

// Comando para mockear la creación de reservas
Cypress.Commands.add('mockCreateReservation', () => {
  cy.intercept('POST', '**/functions/v1/reservation', {
    statusCode: 200,
    body: {
      success: true,
      data: {
        reservation: {
          id: Math.floor(Math.random() * 10000),
          spaceId: 1,
          spaceName: 'Espacio de Prueba',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 3600000).toISOString(),
          estimatedCapacity: 50,
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        payment: {
          id: Math.floor(Math.random() * 10000),
          amount: 50000,
          status: 'pending',
          method: 'online'
        },
        cost: {
          durationHours: 1,
          pricePerHour: 50000,
          totalCost: 50000,
          formattedCost: '$50,000'
        },
        space: {
          id: 1,
          name: 'Espacio de Prueba',
          maxCapacity: 100
        },
        notifications: {
          ownerNotified: true,
          userNotified: true,
          ownerEmail: 'owner@test.com',
          userEmail: 'user@test.com'
        }
      }
    }
  }).as('createReservation');
});

// Comando para establecer autenticación de owner
Cypress.Commands.add('setOwnerAuth', () => {
  const mockTokens = {
    access_token: 'mock-owner-access-token',
    refresh_token: 'mock-owner-refresh-token',
    user: {
      id: 'mock-owner-id',
      email: 'owner@test.com',
      user_type: 'owner',
      name: 'Test Owner'
    }
  };
  
  cy.window().then((win) => {
    win.localStorage.setItem('sb-access-token', mockTokens.access_token);
    win.localStorage.setItem('sb-refresh-token', mockTokens.refresh_token);
    win.localStorage.setItem('user-data', JSON.stringify(mockTokens.user));
  });
});

// Comando para establecer autenticación de cliente
Cypress.Commands.add('setClientAuth', () => {
  const mockTokens = {
    access_token: 'mock-client-access-token',
    refresh_token: 'mock-client-refresh-token',
    user: {
      id: 'mock-client-id',
      email: 'client@test.com',
      user_type: 'client',
      name: 'Test Client'
    }
  };
  
  cy.window().then((win) => {
    win.localStorage.setItem('sb-access-token', mockTokens.access_token);
    win.localStorage.setItem('sb-refresh-token', mockTokens.refresh_token);
    win.localStorage.setItem('user-data', JSON.stringify(mockTokens.user));
  });
});

export {};
