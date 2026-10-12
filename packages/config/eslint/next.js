import nextPlugin from '@next/eslint-plugin-next';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';
import { createConfig } from './index.js';

// Fichiers dont Next.js impose l'export par défaut.
const NEXT_CONVENTION_FILES = [
  '**/app/**/{page,layout,template,loading,error,global-error,not-found,default,route}.tsx',
  '**/app/**/{sitemap,robots,manifest,opengraph-image,icon}.ts{,x}',
  '**/middleware.ts',
  '**/instrumentation.ts',
];

/**
 * Configuration ESLint d'une application Next.js : base + accessibilité stricte + React + Next.
 * @param {{ tsconfigRootDir: string }} options dossier du paquet (`import.meta.dirname`)
 */
export const createNextConfig = (options) =>
  defineConfig(
    createConfig(options),
    { ignores: ['next-env.d.ts'] },
    jsxA11y.flatConfigs.strict,
    reactHooks.configs.flat.recommended,
    {
      plugins: { '@next/next': nextPlugin },
      rules: {
        ...nextPlugin.configs.recommended.rules,
        ...nextPlugin.configs['core-web-vitals'].rules,
      },
    },
    { files: NEXT_CONVENTION_FILES, rules: { 'no-restricted-syntax': 'off' } },
  );
