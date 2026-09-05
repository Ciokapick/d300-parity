import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// Proiectul se publică pe GitHub Pages sub /d300-parity/, dar în dev serverul
// rulează la rădăcină. `command` e 'serve' atât în dev, cât și la `vite preview`,
// deci preview-ul (care servește build-ul) trebuie să folosească același base ca
// build-ul; altfel index.html cere resursele sub /d300-parity/ și serverul le
// servește la rădăcină, iar pagina rămâne goală.
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/d300-parity/' : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}));
