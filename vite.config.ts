import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

// Strict production CSP (AC-15): scripts may only come from the app's own
// origin; no remote script, style, font, image or connect source is allowed.
// Injected at build time so the Vite dev server (which needs its inline
// React-refresh preamble) keeps working, while the built renderer is strict.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

function productionCspPlugin(): Plugin {
  return {
    name: 'notes-app-production-csp',
    apply: 'build',
    transformIndexHtml(html: string): string {
      const meta = `<meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`;
      return html.replace('<head>', `<head>\n    ${meta}`);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), productionCspPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
