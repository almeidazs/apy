import { cron, Patterns } from '@elysiajs/cron';
import { openapi } from '@elysiajs/openapi';
import { opentelemetry } from '@elysiajs/opentelemetry';
import { Elysia } from 'elysia';
import { verify } from '@/config/auth';
import { env } from '@/env';
import { SessionService } from '@/modules/sessions/service';
import { ErrorCode } from '@/shared/errors/code';
import { exception } from '@/shared/errors/exception';
import { commonHeaders } from './util/commonHeaders';

const SIXTY_FOUR_KB_IN_BYTES = 65_536;

export const createApp = () =>
	new Elysia({
		name: env.APP_NAME,
		serve: {
			maxRequestBodySize: SIXTY_FOUR_KB_IN_BYTES,
		},
	})
		.decorate('readyAt', 0)
		.onBeforeHandle(({ set, headers }) => {
			if (headers['content-type'] !== 'application/json')
				return exception('Bad Request', ErrorCode.InvalidContentType);

			set.headers = commonHeaders();
		})
		.use(
			openapi({
				documentation: {
					info: {
						version: '0.0.1',
						title: `${env.APP_NAME} API`,
						description: `Current API for ${env.APP_NAME} project`,
					},
					tags: [
						{
							name: 'PAE',
							description: 'Private API Endpoints',
						},
						{
							name: 'Session',
							description: 'Sessions related enpoints',
						},
					],
				},
				swagger: {
					autoDarkMode: true,
				},
				path: '/docs',
				provider: 'scalar',
				enabled: env.NODE_ENV === 'development',
			}),
		)
		.use(
			opentelemetry({
				serviceName: env.APP_NAME,
			}),
		)
		.use(
			cron({
				catch: true,
				name: 'heartbeat',
				pattern: Patterns.EVERY_HOUR,
				async run() {
					const { count } = await SessionService.sweep({});

					console.debug(`${count} sessions removed`);
				},
			}),
		)
		.derive(({ cookie }) => {
			const { value: access } = cookie.acess;

			if (!access) return exception('Unauthorized', ErrorCode.UnknownAuth);

			const user = verify(access);

			if (!user) return exception('Unauthorized', ErrorCode.InvalidAuth);

			return {
				user,
			};
		})
		.error({
			FAST_JWT_EXPIRED: Error,
			FAST_JWT_MALFORMED: Error,
		})
		.onError(({ code, error }) => {
			if (env.NODE_ENV !== 'production') console.error(error);

			switch (code) {
				case 'NOT_FOUND':
					return exception('Not Found', ErrorCode.UnknownRoute);
				case 'VALIDATION':
					return exception('Bad Request', ErrorCode.InvalidJSONBody, {
						detailed: error.all,
						message: error.detail(error.message),
					});
				case 'INVALID_FILE_TYPE':
					return exception('Bad Request', ErrorCode.InvalidFileType);
				case 'FAST_JWT_MALFORMED':
					return exception('Bad Request', ErrorCode.UnknownAuth);
				case 'FAST_JWT_EXPIRED':
					return exception('Unauthorized', ErrorCode.ExpiredSession);
				default:
					return exception(
						'Internal Server Error',
						ErrorCode.InternalServerError,
					);
			}
		});
