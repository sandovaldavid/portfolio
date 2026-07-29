export default {
	ignores: [
		message =>
			message.includes('Signed-off-by: dependabot[bot]') &&
			/^(chore\(deps\)|ci\(actions\)):/.test(message),
	],
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [
			2,
			'always',
			[
				'feat',
				'fix',
				'docs',
				'style',
				'refactor',
				'perf',
				'test',
				'chore',
				'ci',
				'revert',
				'build',
				'deps',
				'security',
				'hotfix',
			],
		],
		'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
		'type-case': [2, 'always', 'lowercase'],
		'header-max-length': [0],
	},
};
