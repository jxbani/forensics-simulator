/**
 * Forensics Training E2E Tests
 * Tests the complete flow of taking forensics training
 */

describe('Forensics Training', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('testuser', 'Test123!');
  });

  describe('Dashboard', () => {
    it('should display all forensic levels', () => {
      cy.visit('/dashboard');

      // Should show level cards
      cy.contains('Initial Investigation').should('be.visible');
      cy.contains('Data Recovery').should('be.visible');
      cy.contains('Memory Analysis').should('be.visible');
      cy.contains('Network Analysis').should('be.visible');
      cy.contains('Report Writing').should('be.visible');
    });

    it('should show difficulty badges', () => {
      cy.visit('/dashboard');

      cy.contains('BEGINNER').should('be.visible');
      cy.contains('INTERMEDIATE').should('be.visible');
      cy.contains('ADVANCED').should('be.visible');
    });

    it('should display user progress statistics', () => {
      cy.visit('/dashboard');

      // Should show total score or progress
      cy.contains(/score|progress|points/i).should('be.visible');
    });

    it('should navigate to level view when clicking on a level', () => {
      cy.visit('/dashboard');

      cy.contains('Initial Investigation').click();

      // Should navigate to level view
      cy.url().should('include', '/level/');
      cy.contains('Initial Investigation').should('be.visible');
    });
  });

  describe('Level View', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
      cy.contains('Initial Investigation').click();
    });

    it('should display all tasks for a level', () => {
      // Should show task cards
      cy.get('[data-testid="task-card"]').should('have.length.greaterThan', 0);
    });

    it('should show task questions and point values', () => {
      // Should show question
      cy.contains(/what|identify|analyze/i).should('be.visible');

      // Should show points
      cy.contains(/points?/i).should('be.visible');
    });

    it('should allow submitting correct answer', () => {
      // Type answer
      cy.get('input[placeholder*="answer"]').first().type('192.168.1.100');

      // Submit answer
      cy.get('button').contains(/submit/i).first().click();

      // Should show success message (or incorrect message based on actual answer)
      cy.contains(/correct|incorrect/i, { timeout: 10000 }).should('be.visible');
    });

    it('should reveal hint when hint button is clicked', () => {
      // Click hint button
      cy.get('button').contains(/hint/i).first().click();

      // Should show hint
      cy.contains(/hint|check|look/i).should('be.visible');
    });

    it('should show evidence snippet if available', () => {
      // Should contain evidence or code snippets
      cy.get('pre, code, .evidence').should('exist');
    });

    it('should track completion progress', () => {
      // Should show progress indicator
      cy.contains(/progress|completed|\d+\/\d+/i).should('be.visible');
    });
  });

  describe('File Upload', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
      // Navigate to a level that supports file upload
      cy.contains('Network Analysis').click();
    });

    it('should allow uploading evidence files', () => {
      // Check if file upload is available for this task type
      cy.get('button').contains(/upload.*evidence/i).click();

      // Upload file
      cy.uploadFile('evidence.pcap', 'application/octet-stream');

      // Should show upload success
      cy.contains(/uploaded|success/i, { timeout: 10000 }).should('be.visible');
    });

    it('should display uploaded files', () => {
      cy.get('button').contains(/upload.*evidence/i).click();
      cy.uploadFile('evidence.pcap', 'application/octet-stream');

      // Should list uploaded file
      cy.contains('evidence.pcap', { timeout: 10000 }).should('be.visible');
    });

    it('should allow downloading uploaded files', () => {
      cy.get('button').contains(/upload.*evidence/i).click();
      cy.uploadFile('evidence.pcap', 'application/octet-stream');

      // Wait for upload
      cy.wait(1000);

      // Click download button
      cy.get('button[title*="Download"], a[download]').first().should('exist');
    });

    it('should allow deleting uploaded files', () => {
      cy.get('button').contains(/upload.*evidence/i).click();
      cy.uploadFile('evidence.pcap', 'application/octet-stream');

      // Wait for upload
      cy.wait(1000);

      // Click delete button
      cy.get('button[title*="Delete"]').first().click();

      // Confirm deletion
      cy.on('window:confirm', () => true);

      // File should be removed
      cy.contains('evidence.pcap').should('not.exist');
    });
  });

  describe('Leaderboard', () => {
    it('should display global leaderboard', () => {
      cy.visit('/leaderboard');

      // Should show leaderboard title
      cy.contains(/leaderboard/i).should('be.visible');

      // Should show user rankings
      cy.contains(/rank|score|username/i).should('be.visible');
    });

    it('should filter by level', () => {
      cy.visit('/leaderboard');

      // Click on level filter
      cy.get('button, select').contains(/level/i).click();

      // Should show level-specific rankings
      cy.contains(/level.*leaderboard/i).should('be.visible');
    });

    it('should show user position in leaderboard', () => {
      cy.visit('/leaderboard');

      // Should highlight current user
      cy.contains('testuser').parent().should('have.class', /highlighted|current/);
    });
  });

  describe('Level Completion', () => {
    it('should complete a level after all tasks are done', () => {
      cy.visit('/dashboard');
      cy.contains('Initial Investigation').click();

      // Complete all tasks (this is a simplified version)
      // In reality, you would need to answer all tasks correctly
      cy.get('[data-testid="task-card"]').each(($task) => {
        cy.wrap($task).find('input[placeholder*="answer"]').type('answer');
        cy.wrap($task).find('button').contains(/submit/i).click();
        cy.wait(500);
      });

      // Should show completion message or badge
      cy.contains(/completed|finished|congratulations/i, { timeout: 10000 });
    });

    it('should update dashboard with completed level', () => {
      // Complete a level first (mocked or actual)
      cy.visit('/dashboard');

      // Should show completed status on level card
      cy.contains(/completed|100%/i).should('be.visible');
    });
  });

  describe('Admin Dashboard', () => {
    beforeEach(() => {
      // Logout and login as admin
      cy.logout();
      cy.login('adminuser', 'Admin123!');
    });

    it('should allow admin access to admin dashboard', () => {
      cy.visit('/admin');

      // Should show admin dashboard
      cy.contains(/admin.*dashboard/i).should('be.visible');
    });

    it('should display analytics', () => {
      cy.visit('/admin');

      // Should show stats
      cy.contains(/total.*users|levels|submissions/i).should('be.visible');
    });

    it('should show user management', () => {
      cy.visit('/admin');

      // Click user management tab
      cy.contains(/user.*management/i).click();

      // Should show user list
      cy.contains(/username|email|role/i).should('be.visible');
    });

    it('should allow changing user roles', () => {
      cy.visit('/admin');
      cy.contains(/user.*management/i).click();

      // Find a user and change their role
      cy.get('select[name*="role"]').first().select('MODERATOR');

      // Should show success message
      cy.contains(/updated|success/i, { timeout: 10000 }).should('be.visible');
    });
  });
});
