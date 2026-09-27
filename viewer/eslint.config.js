import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', 'node_modules/', 'coverage/', 'test/e2e/.results/', 'test/e2e/mkdocs/site/', 'test/e2e/react/dist/', 'test/e2e/react/node_modules/', 'test/e2e/react/public/', 'playwright-report/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['scripts/**', 'test/e2e/**', 'playwright.config.ts'],
    languageOptions: {
      globals: { URL: 'readonly', console: 'readonly', process: 'readonly', document: 'readonly', getComputedStyle: 'readonly', HTMLElement: 'readonly' },
    },
  },
  {
    // The React fixture app (test/e2e/react/) is plain JSX in the browser.
    files: ['test/e2e/react/src/**/*.jsx'],
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { Blob: 'readonly' },
    },
  },
);
