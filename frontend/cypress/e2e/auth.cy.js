/**
 * Authentication E2E Tests
 */

describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Registration', () => {
    it('should allow a new user to register', () => {
      const timestamp = Date.now();
      const username = `testuser${timestamp}`;
      const email = `test${timestamp}@example.com`;
      const password = 'Test123!';

      cy.visit('/register');

      // Fill in registration form
      cy.get('input[name="username"]').type(username);
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);

      // Submit form
      cy.get('button[type="submit"]').contains(/register/i).click();

      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');

      // Should show welcome message
      cy.contains(new RegExp(`welcome.*${username}`, 'i')).should('be.visible');

      // Should store auth token
      cy.checkAuth();
    });

    it('should show error for duplicate username', () => {
      cy.visit('/register');

      cy.get('input[name="username"]').type('existinguser');
      cy.get('input[name="email"]').type('new@example.com');
      cy.get('input[name="password"]').type('Test123!');

      cy.get('button[type="submit"]').contains(/register/i).click();

      // Should show error message
      cy.contains(/username.*already.*exists/i).should('be.visible');
    });

    it('should validate email format', () => {
      cy.visit('/register');

      cy.get('input[name="username"]').type('newuser');
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type('Test123!');

      // Should show validation error
      cy.get('input[name="email"]:invalid').should('exist');
    });

    it('should validate password strength', () => {
      cy.visit('/register');

      cy.get('input[name="password"]').type('weak');

      // Should show password strength indicator
      cy.contains(/weak.*password/i).should('be.visible');
    });
  });

  describe('Login', () => {
    it('should allow existing user to login', () => {
      cy.visit('/login');

      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('Test123!');

      cy.get('button[type="submit"]').contains(/login/i).click();

      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');

      // Should show welcome message
      cy.contains(/welcome/i).should('be.visible');

      // Should store auth token
      cy.checkAuth();
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');

      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('wrongpassword');

      cy.get('button[type="submit"]').contains(/login/i).click();

      // Should show error message
      cy.contains(/invalid.*credentials/i).should('be.visible');
    });

    it('should not allow empty form submission', () => {
      cy.visit('/login');

      // Submit button should be disabled
      cy.get('button[type="submit"]').should('be.disabled');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      // Login first
      cy.login('testuser', 'Test123!');
    });

    it('should logout user and redirect to login page', () => {
      cy.logout();

      // Should redirect to login
      cy.url().should('include', '/login');

      // Should clear localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
        expect(win.localStorage.getItem('user')).to.be.null;
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login', () => {
      cy.visit('/dashboard');

      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should allow authenticated users to access protected routes', () => {
      cy.login('testuser', 'Test123!');

      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');
    });

    it('should allow admin users to access admin dashboard', () => {
      cy.login('adminuser', 'Admin123!');
      cy.checkAdminRole();

      cy.visit('/admin');
      cy.url().should('include', '/admin');
    });
  });
});
