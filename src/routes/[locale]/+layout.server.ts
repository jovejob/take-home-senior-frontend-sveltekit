import { error } from '@sveltejs/kit';
import { SUPPORTED_LOCALES, type Locale } from '$lib/schemas/locale';
import type { LayoutServerLoad } from './$types';

function isSupportedLocale(value: string): value is Locale {
	return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export const load: LayoutServerLoad = ({ params }) => {
	if (!isSupportedLocale(params.locale)) {
		throw error(404, 'Not found');
	}
	return { locale: params.locale };
};
