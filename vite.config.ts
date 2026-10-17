import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { app } from './server/server.js';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'college-lms-backend-api',
      configureServer(server) {
        // Mount Express API server directly onto Vite dev server middleware
        server.middlewares.use(app);
      },
    },
  ],
});
