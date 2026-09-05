import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitest/config';

// Modelul de domeniu nu depinde de DOM, iar testele citesc fișiere din
// legacy/extracted, deci rulăm în Node, nu în jsdom.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
