// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    jasmine: true,
    jquery: true
  },
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  extends: 'standard',
  // required to lint *.vue files
//  plugins: [
//    'html'
//  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'indent': 0,
    'spaced-comment': ['error', 'always', 
      { 'exceptions': [
        'removeIf(production)', 
        'endRemoveIf(production)', 
        '!steal-remove-start', 
        '!steal-remove-end'
      ] }],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-undef': 'error',
    "no-tabs": 0,
    // Allowing these for demo-only
    'semi': 0,
    'quotes': 0,
    'padded-blocks': 0,
    'no-trailing-spaces': 0,
    'spaced-comment': 0,
    'no-multi-spaces': 0,
    'space-infix-ops': 0
  },
  'globals': {
      'System': true,
      'testit': true,
      'testOnly': true,
      'Stache': true,
      'steal': true,
      'rmain_container': true,
      'FuseBox': true,
      'process': true,
      '__karma__': true,
      'define': true,
      'spyOnEvent': true,
      'Popper': true
  }
}
