import { z } from 'zod';

export const LocaleSchema = z.enum(['en', 'de']);
export type Locale = z.infer<typeof LocaleSchema>;

export const TagSchema = z.object({
	slug: z.string().min(1),
	label: z.object({
		en: z.string().min(1),
		de: z.string().min(1)
	})
});

export type Tag = z.infer<typeof TagSchema>;
export const TagsSchema = z.array(TagSchema);
