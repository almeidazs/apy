import type { app } from '@/app';
import { env } from '@/env';
import { SessionModel } from './model';
import { SessionService } from './service';

export const route = (elysia: typeof app) =>
	elysia.group('/sessions', (sessions) =>
		sessions
			.guard({
				tags: ['Session'],
			})
			.post(
				'',
				async ({ body, cookie }) => {
					const { user, session } = await SessionService.signUp(body);

					const FIFTEEN_MIN_IN_MS = 900000;
					const FIFTEEN_DAYS_IN_MS = 1.296e9;
					const isProduction = env.NODE_ENV === 'production';

					cookie.access.set({
						httpOnly: true,
						secure: isProduction,
						value: session.access,
						maxAge: FIFTEEN_MIN_IN_MS,
					});

					cookie.refresh.set({
						httpOnly: true,
						sameSite: 'strict',
						secure: isProduction,
						value: session.refresh,
						maxAge: FIFTEEN_DAYS_IN_MS,
					});

					return user;
				},
				{
					detail: {
						description: 'Create a new user account in database',
					},
					body: SessionModel.SIGN_UP_SCHEMA,
					response: SessionModel.SIGN_UP_RESPONSE,
				},
			)
			.get('', ({ user }) => SessionService.list({ userId: user.id }), {
				detail: {
					description: 'List all sessions related to the current user',
				},
				response: SessionModel.LIST_RESPONSE,
			})
			.delete(
				'/@me',
				async ({ cookie: { access, refresh } }) => {
					await SessionService.signOut({ token: refresh.value as string });

					access.remove();
					refresh.remove();
				},
				{
					detail: {
						description:
							'Revoke the current session of the request and delete it in the database',
					},
					response: SessionModel.NO_CONTENT_RESPONSE,
				},
			)
			.delete(
				'',
				async ({ user, cookie: { access, refresh } }) => {
					const MAX_SESSIONS_PER_USER = 10;

					await SessionService.sweep({
						userId: user.id,
						limit: MAX_SESSIONS_PER_USER,
					});

					access.remove();
					refresh.remove();
				},
				{
					detail: {
						description: 'Revoke all sessions related to the current user',
					},
					response: SessionModel.NO_CONTENT_RESPONSE,
				},
			)
			.post('/gen-code', ({ body }) => SessionService.genCode(body), {
				detail: {
					description: 'Generate a 8-digit code to create a new user account',
				},
				body: SessionModel.GEN_CODE_SCHEMA,
				response: SessionModel.GEN_CODE_RESPONSE,
			})
			.post(
				'/sign-in',
				async ({ body, cookie }) => {
					const { user, session } = await SessionService.signIn(body);

					const FIFTEEN_MIN_IN_MS = 900000;
					const FIFTEEN_DAYS_IN_MS = 1.296e9;
					const isProduction = env.NODE_ENV === 'production';

					cookie.access.set({
						httpOnly: true,
						secure: isProduction,
						value: session.access,
						maxAge: FIFTEEN_MIN_IN_MS,
					});

					cookie.refresh.set({
						httpOnly: true,
						sameSite: 'strict',
						secure: isProduction,
						value: session.refresh,
						maxAge: FIFTEEN_DAYS_IN_MS,
					});

					return user;
				},
				{
					detail: {
						description: 'Log in to an already created account',
					},
					body: SessionModel.SIGN_IN_SCHEMA,
					response: SessionModel.SIGN_IN_RESPONSE,
				},
			),
	);
