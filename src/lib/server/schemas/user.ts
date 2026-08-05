import { z } from 'zod';

export const USER_ROLES = ['admin', 'editor', 'viewer'] as const;
export const UserRoleSchema = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof UserRoleSchema>;

// Matches mocks/users.json exactly, plaintext password included. This shape
// must never cross the server boundary — see SafeUserSchema below.
export const UserSchema = z.object({
	id: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(1),
	name: z.string().min(1),
	role: UserRoleSchema
});

export type User = z.infer<typeof UserSchema>;
export const UsersSchema = z.array(UserSchema);

// What's actually allowed to reach the client / session — never the password.
export const SafeUserSchema = UserSchema.omit({ password: true });
export type SafeUser = z.infer<typeof SafeUserSchema>;

export function toSafeUser(user: User): SafeUser {
	const { password: _password, ...safe } = user;
	return safe;
}
