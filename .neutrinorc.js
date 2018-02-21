module.exports = {
  use: [
    [
      '@neutrinojs/airbnb-base',
      {
        eslint: {
          rules: {
            "no-console": 0,
            "no-await-in-loop": 0,
            "no-param-reassign": 0,
            "no-return-assign": 0,
            "guard-for-in": 0,
            "no-restricted-syntax": 0,
            "no-loop-func": 0,
            "import/prefer-default-export": 0,
            "no-mixed-operators": 0,
            "no-unused-vars": 0,
            "prefer-destructuring": 0
          }
        }
      }
    ],
    [
      '@neutrinojs/node',
      {
        html: {
          title: 'Firefox health backend'
        },
      }
    ],
    ['@neutrinojs/mocha', { exit: true }]
  ]
};
