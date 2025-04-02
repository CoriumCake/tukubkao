module.exports = {
    extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
    plugins: ['prettier'],
    rules: {
      'prettier/prettier': ['error'],
      'react/jsx-indent': ['error', 2],
    },
  };
  