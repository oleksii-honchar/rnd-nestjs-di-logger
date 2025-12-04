const globals = require('globals');
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const eslintPrettier = require('eslint-plugin-prettier');

const eslintConfigBase = require('./eslint.config.base');

module.exports = tseslint.config(
  ...eslintConfigBase,
  {
    files: ['src/**/*.ts'],
    plugins: {
      'typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      parser: tseslint.parser,
      parserOptions: {
        project: true,
      },
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/**/*.ts'],
    plugins: {
      prettier: eslintPrettier,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          ...require('./.prettierrc.base.js'),
        },
      ],
    },
  },
);
