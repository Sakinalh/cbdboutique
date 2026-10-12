import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

const IGNORED_PATHS = ['**/dist/**', '**/.next/**', '**/.turbo/**', '**/coverage/**'];
const JS_FILES = ['**/*.{js,mjs,cjs}'];
const TEST_FILES = ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'];
// Fichiers dont l'outil impose un export par défaut.
const DEFAULT_EXPORT_FILES = ['**/*.config.{js,mjs,ts}'];

const cleanCodeRules = {
  complexity: ['error', 10],
  'max-depth': ['error', 3],
  'max-params': ['error', 3],
  'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
  'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
  'no-nested-ternary': 'error',
  'no-param-reassign': 'error',
  'no-console': 'error',
  eqeqeq: 'error',
  'no-restricted-syntax': [
    'error',
    {
      selector: 'ExportDefaultDeclaration',
      message: 'Utiliser un export nommé (sauf fichiers imposés par un outil).',
    },
  ],
};

const typeScriptRules = {
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  '@typescript-eslint/consistent-type-imports': 'error',
  '@typescript-eslint/naming-convention': [
    'error',
    { selector: 'default', format: ['camelCase'] },
    { selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase'] },
    { selector: 'function', format: ['camelCase', 'PascalCase'] },
    { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
    { selector: 'typeLike', format: ['PascalCase'] },
    { selector: 'enumMember', format: ['PascalCase'] },
    // Noms imposés de l'extérieur : en-têtes HTTP, JSON-LD (`@type`), colonnes SQL…
    { selector: ['objectLiteralProperty', 'typeProperty', 'import'], format: null },
  ],
};

/**
 * Configuration ESLint partagée par tous les paquets.
 * @param {{ tsconfigRootDir: string }} options dossier du paquet (`import.meta.dirname`)
 */
export const createConfig = ({ tsconfigRootDir }) =>
  defineConfig(
    { ignores: IGNORED_PATHS },
    js.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
      languageOptions: { parserOptions: { projectService: true, tsconfigRootDir } },
      linterOptions: { reportUnusedDisableDirectives: 'error' },
      rules: { ...cleanCodeRules, ...typeScriptRules },
    },
    { files: JS_FILES, extends: [tseslint.configs.disableTypeChecked] },
    { files: DEFAULT_EXPORT_FILES, rules: { 'no-restricted-syntax': 'off' } },
    { files: TEST_FILES, rules: { 'max-lines-per-function': 'off' } },
  );
