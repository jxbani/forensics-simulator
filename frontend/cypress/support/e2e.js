/**
 * Cypress E2E Support File
 * Loaded before every test file
 */

// Import commands
import './commands';

// Configure Cypress
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing tests on uncaught exceptions
  // This is useful for third-party scripts that may throw errors
  return false;
});

// Add custom global before hook
beforeEach(() => {
  // Clear local storage before each test
  cy.clearLocalStorage();

  // Clear cookies
  cy.clearCookies();

  // Reset database state (if needed)
  // cy.task('db:reset');
});

// Add custom global after hook
afterEach(() => {
  // Take screenshot on test failure
  // Cypress does this automatically, but you can customize it here
});
