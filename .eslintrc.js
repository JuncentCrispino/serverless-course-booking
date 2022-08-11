module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
    'node': true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module'
  },
  'rules': {
    'quotes': ['error', 'single'],
    // we want to force semicolons
    'semi': ['error', 'always'],
    // we use 2 spaces to indent our code
    'indent': ['error', 2],
    // we want to avoid extraneous spaces
    'no-multi-spaces': ['error'],
    'no-console': ['off'],
    'func-names': 'off',
    'no-underscore-dangle': 'off',
    'security/detect-object-injection': 'off',
    'object-curly-spacing': ['error', 'always', { 'objectsInObjects': true }]
  }
};
  