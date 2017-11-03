// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  extends: 'airbnb-base',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // check if imports actually resolve
  settings: {
  },
  // add your custom rules here
  rules: {
    "no-console": 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
