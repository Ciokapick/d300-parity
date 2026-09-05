import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // tools/ conține JRE-ul portabil și kitul DUKIntegrator, descărcate (vezi docs/DUK.md)
    ignores: ['dist/**', 'node_modules/**', 'legacy/**', 'harness/oracle/**', 'coverage/**', 'tools/**'],
  },

  js.configs.recommended,
  tseslint.configs.recommended,
  pluginVue.configs['flat/recommended'],

  // fișierele .vue sunt parsate de vue-eslint-parser, care delegă <script lang="ts">
  // către parserul TypeScript
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
      },
    },
  },

  {
    files: ['**/*.{js,mjs,ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // registrul de câmpuri e generat de harness/gen-fields.mjs
  {
    files: ['harness/gen-fields.mjs'],
    languageOptions: { globals: { ...globals.node } },
  },
);
