/**
 * Cypress Custom Commands
 */

/**
 * Custom command to login
 * Usage: cy.login('username', 'password')
 */
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login');
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').contains(/login/i).click();
  cy.url().should('include', '/dashboard');
});

/**
 * Custom command to register a new user
 * Usage: cy.register('username', 'email', 'password')
 */
Cypress.Commands.add('register', (username, email, password) => {
  cy.visit('/register');
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').contains(/register/i).click();
  cy.url().should('include', '/dashboard');
});

/**
 * Custom command to logout
 * Usage: cy.logout()
 */
Cypress.Commands.add('logout', () => {
  cy.get('button').contains(/logout/i).click();
  cy.url().should('include', '/login');
});

/**
 * Custom command to intercept API calls
 * Usage: cy.interceptAPI('GET', '/api/levels', { fixture: 'levels.json' })
 */
Cypress.Commands.add('interceptAPI', (method, url, response) => {
  cy.intercept(method, url, response).as('apiCall');
});

/**
 * Custom command to submit an answer to a task
 * Usage: cy.submitAnswer('192.168.1.100')
 */
Cypress.Commands.add('submitAnswer', (answer) => {
  cy.get('input[placeholder*="answer"]').type(answer);
  cy.get('button').contains(/submit/i).click();
});

/**
 * Custom command to upload a file
 * Usage: cy.uploadFile('evidence.pcap', 'application/octet-stream')
 */
Cypress.Commands.add('uploadFile', (fileName, mimeType) => {
  cy.get('input[type="file"]').selectFile({
    contents: Cypress.Buffer.from('test file content'),
    fileName: fileName,
    mimeType: mimeType,
  });
});

/**
 * Custom command to check if user is authenticated
 * Usage: cy.checkAuth()
 */
Cypress.Commands.add('checkAuth', () => {
  cy.window().its('localStorage.token').should('exist');
  cy.window().its('localStorage.user').should('exist');
});

/**
 * Custom command to set auth token
 * Usage: cy.setAuthToken('token', { user: {...} })
 */
Cypress.Commands.add('setAuthToken', (token, user) => {
  cy.window().then((win) => {
    win.localStorage.setItem('token', token);
    win.localStorage.setItem('user', JSON.stringify(user));
  });
});

/**
 * Custom command to check for admin role
 * Usage: cy.checkAdminRole()
 */
Cypress.Commands.add('checkAdminRole', () => {
  cy.window().then((win) => {
    const user = JSON.parse(win.localStorage.getItem('user'));
    expect(user.role).to.be.oneOf(['ADMIN', 'MODERATOR']);
  });
});
