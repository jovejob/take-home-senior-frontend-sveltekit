import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
	js.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		}
	},
	{
		files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json'
			}
		},
		plugins: { '@typescript-eslint': tseslint },
		rules: {
			...tseslint.configs.recommended.rules,
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
		}
	},
	{
		// Root-level tooling config files aren't part of the app's tsconfig
		// (which only includes src/), so lint them syntax-only — no `project`,
		// no type-aware rules.
		files: ['*.config.ts', '*.config.js'],
		languageOptions: {
			parser: tsParser
		},
		plugins: { '@typescript-eslint': tseslint },
		rules: {
			'@typescript-eslint/no-explicit-any': 'error'
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: (await import('svelte-eslint-parser')).default,
			parserOptions: {
				parser: tsParser
			}
		}
	},
	{
		ignores: [
			'.svelte-kit/**',
			'build/**',
			'.vercel/**',
			'node_modules/**',
			'playwright-report/**',
			'test-results/**',
			'coverage/**'
		]
	}
];
