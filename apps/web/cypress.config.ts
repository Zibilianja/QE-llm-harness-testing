import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    defaultCommandTimeout: 10000,
    requestTimeout: 20000,
    video: false,
    setupNodeEvents(on, config) {
      const mode = config.env.LLM_MODE === 'record' ? 'record' : 'replay';

      config.env.LLM_MODE = mode;

      return config;
    },
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
