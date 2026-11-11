import { createConfig } from '@cbd/config/eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  { ignores: ['worker-configuration.d.ts'] },
  createConfig({ tsconfigRootDir: import.meta.dirname }),
  {
    // Cloudflare Workers impose un export par défaut pour le point d'entrée.
    files: ['src/index.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
);
