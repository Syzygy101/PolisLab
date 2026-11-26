import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'polislab-deterministic-e2e-fonts',
      apply: 'serve',
      transformIndexHtml(html) {
        // Local functional tests use the CSS fallback stack. Hosted tests use real font requests.
        if (process.env.POLISLAB_E2E_LOCAL_FONTS !== '1') return html;
        return html.replace(/<link\b[^>]*href="https:\/\/fonts\.(?:googleapis|gstatic)\.com[^"]*"[^>]*>/g, '');
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  server: {
    port: 5173,
  },
});
