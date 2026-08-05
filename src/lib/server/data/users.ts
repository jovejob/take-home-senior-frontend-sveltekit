import rawUsers from './mocks/users.json';
import { UsersSchema } from '$lib/server/schemas/user';

const USERS = UsersSchema.parse(rawUsers);

/** Includes the plaintext password — callers (the login action) are
 * responsible for verifying it server-side and never forwarding it further.
 * Use toSafeUser() from $lib/server/schemas/user before it reaches a
 * session, a load return value, or the client. */
export function findUserByEmail(email: string) {
	return USERS.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function findUserById(id: string) {
	return USERS.find((user) => user.id === id) ?? null;
}
