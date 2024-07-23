const parser = require('@typescript-eslint/parser');

module.exports = {
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: {
      env: 'writable',
      jest: 'writable',
    },
    parser: parser,
    parserOptions: {
      // project: 'tsconfig.json',
      requireConfigFile: false,
      tsconfigRootDir: __dirname,
      plugins: ['@typescript-eslint/eslint-plugin'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      ],
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
