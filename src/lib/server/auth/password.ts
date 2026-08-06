/**
 * mocks/users.json ships plaintext passwords for demo convenience (see
 * mocks/README.md). Verification still happens server-side, never via a
 * client-side `if (password === ...)` check — the comparison itself is
 * isolated here so swapping in real hashing (e.g. bcrypt/argon2) later is a
 * one-function change with no callers to touch.
 */
export function verifyPassword(submitted: string, stored: string): boolean {
	return submitted === stored;
}
