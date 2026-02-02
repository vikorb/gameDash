/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'doc',
        'docs',
        'feat',
        'fix',
        'chore',
        'refactor',
        'test',
        'build',
        'ci',
        'perf',
        'style',
        'revert',
      ],
    ],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'header-max-length': [2, 'always', 300],
  },
  ignores: [
    (msg) => msg.startsWith('Merge ') || msg.startsWith('fixup!') || msg.startsWith('squash!'),
  ],
}
