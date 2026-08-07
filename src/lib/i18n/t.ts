/**
 * Minimal interpolating translator. Looks up `key` in `messages` and
 * replaces `{placeholder}` tokens with values from `params`. Falls back to
 * the raw key if the message is missing, so a missing translation is
 * visible/debuggable rather than silently blank.
 */
export function t(
	messages: Record<string, string>,
	key: string,
	params?: Record<string, string | number>
): string {
	let template = messages[key] ?? key;
	if (params) {
		for (const [name, value] of Object.entries(params)) {
			template = template.replaceAll(`{${name}}`, String(value));
		}
	}
	return template;
}
