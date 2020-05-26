module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'athom',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    "node/no-unsupported-features/es-syntax": "off",
    "no-useless-constructor": "off",
    "@typescript-eslint/no-useless-constructor": ["error"]
  },
};
