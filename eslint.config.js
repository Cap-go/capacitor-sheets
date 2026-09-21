const ionic = require('@ionic/eslint-config/recommended');

module.exports = [
  {
    ignores: [
      'dist',
      'example-app',
      'docs',
      'examples',
      'ios',
      'android',
      'scripts/check-cap9-deprecated.mjs',
      'scripts/generate-ai-changelog.mjs',
    ],
  },
  ...ionic,
];
