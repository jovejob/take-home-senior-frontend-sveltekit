import type { Config } from 'tailwindcss';

// Semantic tokens only. Components should reach for `bg-surface`, `text-fg`,
// `border-default`, `bg-accent`, etc — never raw Tailwind palette classes like
// `bg-blue-500`. Each token below is a CSS variable defined per-theme in
// src/lib/styles/tokens.css, so light/dark is a variable swap, not a parallel
// class list (see [data-theme] selectors in tokens.css).
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: ['selector', '[data-theme="dark"]'],
	theme: {
		extend: {
			colors: {
				bg: 'rgb(var(--color-bg) / <alpha-value>)',
				surface: 'rgb(var(--color-surface) / <alpha-value>)',
				'surface-soft': 'rgb(var(--color-surface-soft) / <alpha-value>)',
				fg: 'rgb(var(--color-fg) / <alpha-value>)',
				'fg-muted': 'rgb(var(--color-fg-muted) / <alpha-value>)',
				border: {
					DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
					strong: 'rgb(var(--color-border-strong) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
					ink: 'rgb(var(--color-accent-ink) / <alpha-value>)',
					soft: 'rgb(var(--color-accent-soft) / <alpha-value>)'
				},
				danger: 'rgb(var(--color-danger) / <alpha-value>)',
				success: 'rgb(var(--color-success) / <alpha-value>)',
				warning: 'rgb(var(--color-warning) / <alpha-value>)'
			},
			borderRadius: {
				sm: 'var(--radius-sm)',
				DEFAULT: 'var(--radius)',
				lg: 'var(--radius-lg)'
			},
			fontFamily: {
				sans: 'var(--font-sans)',
				mono: 'var(--font-mono)'
			},
			spacing: {
				// semantic spacing scale layered on top of Tailwind's default —
				// extend only, never override, so arbitrary values stay available
				gutter: 'var(--space-gutter)'
			}
		}
	},
	plugins: []
} satisfies Config;
