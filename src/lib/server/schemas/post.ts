import { z } from 'zod';

const HexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'must be a 6-digit hex color');

const PostTranslationSchema = z.object({
	title: z.string().min(1),
	excerpt: z.string().min(1),
	body: z.string().min(1) // markdown
});

export const PostSchema = z.object({
	id: z.string().min(1),
	slug: z.string().min(1),
	translations: z.object({
		en: PostTranslationSchema,
		de: PostTranslationSchema
	}),
	tags: z.array(z.string()),
	author: z.object({
		id: z.string().min(1),
		name: z.string().min(1),
		avatarColor: HexColorSchema
	}),
	publishedAt: z.string().datetime(),
	readingTimeMinutes: z.number().int().positive(),
	coverColor: HexColorSchema
});

export type Post = z.infer<typeof PostSchema>;
export const PostsSchema = z.array(PostSchema);
