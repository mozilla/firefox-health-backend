const airbnbBase = require('@neutrinojs/airbnb-base');
const node = require('@neutrinojs/node');
const mocha = require('@neutrinojs/mocha');

module.exports = {
  options: {
    mains: {
      index: 'index',
      nimbledroid: 'scripts/fetchNimbledroidData.js',
    },
    root: __dirname,
  },
  use: [
    airbnbBase({
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
    }),
    node({
      html: {
        title: 'Firefox health backend'
      },
    }),
    mocha({
      exit: true,
      recursive: true,
    }),
  ]
};
