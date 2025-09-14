import type { app } from '@/app';
import { env } from '@/env';
import { SessionModel } from './model';
import { SessionService } from './service';

export const route = (elysia: typeof app) =>
	elysia.group('/sessions', (sessions) =>
		sessions
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
					body: SessionModel.SIGN_UP_SCHEMA,
				},
			)
			.get('', ({ user }) => SessionService.list({ userId: user.id }))
			.delete('/@me', async ({ cookie: { access, refresh } }) => {
				await SessionService.signOut({ token: refresh.value });

				access.remove();
				refresh.remove();
			})
			.delete('', async ({ user, cookie: { access, refresh } }) => {
				const MAX_SESSIONS_PER_USER = 10;

				await SessionService.sweep({
					userId: user.id,
					limit: MAX_SESSIONS_PER_USER,
				});

				access.remove();
				refresh.remove();
			})
			.post('/gen-code', ({ body }) => SessionService.genCode(body), {
				body: SessionModel.GEN_CODE_SCHEMA,
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
					body: SessionModel.SIGN_IN_SCHEMA,
				},
			),
	);
