module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-min-length': async () => [2, 'always', 8]
  }
}