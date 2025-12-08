/**
 * Cypress E2E Testing Configuration
 */

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    video: true,
    screenshot​OnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,

    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0,
    },

    env: {
      apiUrl: 'http://localhost:5000/api',
    },
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx}',
    supportFile: 'cypress/support/component.js',
  },
});
