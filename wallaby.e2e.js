module.exports = function (w) {
  return {
    files: ['src/**/*.ts'],

    tests: ['/test/app.e2e-spec.ts'],

    env: {
      type: 'node',
      runner: 'node',
    },

    // testFramework: 'jest',

    debug: true,
  };
};
