import { t } from 'elysia';

// 8-52 chars (Required one upper and lower letter, and a number)
const PASSWORD_PATTERN = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,52}$';

export namespace SessionModel {
	export const GEN_CODE_SCHEMA = t.Object({
		email: t.String({
			format: 'email',
			error: 'Unknown email format, use name@domain',
		}),
	});

	export const GEN_CODE_RESPONSE = t.Object({
		code: t.String({
			examples: ['M9CYJJGH'],
			description: 'The generated code to valited with the email',
		}),
	});

	export type GenCodeBody = typeof GEN_CODE_SCHEMA.static;

	export const SIGN_UP_SCHEMA = t.Intersect([
		GEN_CODE_SCHEMA,
		t.Object({
			password: t.String({
				pattern: PASSWORD_PATTERN,
				error: 'Invalid user password',
			}),
			code: t.String({
				minLength: 8,
				maxLength: 8,
				error: 'Invalid temporary code, generate again',
			}),
		}),
	]);

	export const SIGN_UP_RESPONSE = t.Object({
		id: t.String({
			description: 'ID of the user',
			examples: ['98764432452227072'],
		}),
	});

	export type SignUpBody = typeof SIGN_UP_SCHEMA.static;

	export const SIGN_IN_SCHEMA = t.Omit(SIGN_UP_SCHEMA, ['code']);

	export const SIGN_IN_RESPONSE = t.Object(SIGN_UP_RESPONSE.properties);

	export type SignInBody = typeof SIGN_IN_SCHEMA.static;

	export interface SignOutOptions {
		token?: string;
	}

	export interface SweepCredentialsOptions {
		limit?: number;
		userId?: bigint;
	}

	export interface ListOptions {
		userId: bigint;
	}

	export const LIST_RESPONSE = t.Array(
		t.Object({
			id: t.String({
				description: 'Session ID',
				examples: ['98764933092167680'],
			}),
			expiresAt: t.Date({
				description: 'ISO string of when the session will expire',
			}),
		}),
	);

	export const NO_CONTENT_RESPONSE = t.Void();
}
