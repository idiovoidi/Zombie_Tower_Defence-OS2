import js from '@eslint/js';
import ts from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  
  // Base configuration
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: ts.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/include': ['src/**/*.ts'],
      'boundaries/elements': [
        {
          type: 'config',
          pattern: ['src/config/**/*.ts'],
        },
        {
          type: 'managers',
          pattern: ['src/managers/**/*.ts'],
        },
        {
          type: 'objects',
          pattern: ['src/objects/**/*.ts'],
        },
        {
          type: 'components',
          pattern: ['src/components/**/*.ts'],
        },
        {
          type: 'renderers',
          pattern: ['src/renderers/**/*.ts'],
        },
        {
          type: 'ui',
          pattern: ['src/ui/**/*.ts'],
        },
        {
          type: 'utils',
          pattern: ['src/utils/**/*.ts'],
        },
        {
          type: 'types',
          pattern: ['src/types/**/*.ts'],
        },
        {
          type: 'main',
          pattern: ['src/main.ts'],
        },
      ],
    },
    rules: {
      // Disable unused vars for underscore-prefixed parameters
      '@typescript-eslint/no-unused-vars': ['error', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'caughtErrorsIgnorePattern': '^_'
      }],
      // Disable explicit any warnings (keep for awareness)
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  
  // Boundary rules - enforce architectural layer dependencies
  {
    files: ['src/**/*.ts'],
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          message: '${file.type} is not allowed to import ${dependency.type}',
          rules: [
            // config - no internal imports (only node_modules)
            { from: 'config', allow: [] },
            // types - only config
            { from: 'types', allow: ['config'] },
            // utils - config, types
            { from: 'utils', allow: ['config', 'types'] },
            // components - config, types
            { from: 'components', allow: ['config', 'types'] },
            // objects - config, types, components, utils, renderers
            { from: 'objects', allow: ['config', 'types', 'components', 'utils', 'renderers'] },
            // renderers - config, types, components, utils, objects
            { from: 'renderers', allow: ['config', 'types', 'components', 'utils', 'objects'] },
            // managers - config, types, components, utils, objects, renderers
            { from: 'managers', allow: ['config', 'types', 'components', 'utils', 'objects', 'renderers'] },
            // ui - config, types, components, utils, objects, managers, renderers
            { from: 'ui', allow: ['config', 'types', 'components', 'utils', 'objects', 'managers', 'renderers'] },
            // main - everything
            { from: 'main', allow: ['config', 'types', 'utils', 'components', 'objects', 'renderers', 'managers', 'ui'] },
          ],
        },
      ],
      'boundaries/no-unknown': ['error'],
    },
  },
  
  // Ignore patterns
  {
    ignores: [
      'dist/**/*',
      'node_modules/**/*',
      '**/*.test.ts',
      'tests/**/*',
      '**/*.d.ts',
    ],
  },
];
