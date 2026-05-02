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
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        {
          type: 'config',
          pattern: ['src/config/*', 'src/config/**/*'],
        },
        {
          type: 'managers',
          pattern: ['src/managers/*', 'src/managers/**/*'],
        },
        {
          type: 'objects',
          pattern: ['src/objects/*', 'src/objects/**/*'],
        },
        {
          type: 'components',
          pattern: ['src/components/*', 'src/components/**/*'],
        },
        {
          type: 'renderers',
          pattern: ['src/renderers/*', 'src/renderers/**/*'],
        },
        {
          type: 'systems',
          pattern: ['src/systems/*', 'src/systems/**/*'],
        },
        {
          type: 'ui',
          pattern: ['src/ui/*', 'src/ui/**/*'],
        },
        {
          type: 'utils',
          pattern: ['src/utils/*', 'src/utils/**/*'],
        },
        {
          type: 'types',
          pattern: ['src/types/*', 'src/types/**/*'],
        },
        {
          type: 'main',
          pattern: ['src/main.ts', 'src/index.ts'],
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
  
  // Boundary rules - disabled, using dependency-cruiser instead
  // {
  //   files: ['src/**/*.ts'],
  //   rules: {
  //     'boundaries/element-types': ['error', { ... }],
  //     'boundaries/no-unknown': ['error'],
  //     'boundaries/no-private': ['error'],
  //   },
 // },
  
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
