import { defineConfig } from 'cypress';

export default defineConfig({
  allowCypressEnv: false,
  e2e: {
    baseUrl: 'http://localhost:5173',
    defaultCommandTimeout: 10000,
    requestTimeout: 20000,
    video: false,
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
