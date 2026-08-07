import { z } from 'zod';

export { SUPPORTED_LOCALES, LocaleSchema } from '$lib/schemas/locale';
export type { Locale } from '$lib/schemas/locale';

export const TagSchema = z.object({
	slug: z.string().min(1),
	label: z.object({
		en: z.string().min(1),
		de: z.string().min(1)
	})
});

export type Tag = z.infer<typeof TagSchema>;
export const TagsSchema = z.array(TagSchema);
