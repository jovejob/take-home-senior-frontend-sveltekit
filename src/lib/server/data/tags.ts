import rawTags from './mocks/tags.json';
import { TagsSchema } from '$lib/server/schemas/tag';
import type { Locale } from '$lib/server/schemas/tag';

const TAGS = TagsSchema.parse(rawTags);

export function getTags() {
	return TAGS;
}

export function getTagLabel(slug: string, locale: Locale): string {
	return TAGS.find((tag) => tag.slug === slug)?.label[locale] ?? slug;
}
