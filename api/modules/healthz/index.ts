import type { app } from '@/app';
import { HealthzModel } from './model';
import { HealthzService } from './service';

export const route = (elysia: typeof app) =>
	elysia.get('/healthz', ({ readyAt }) => HealthzService.get({ readyAt }), {
		tags: ['PAE'],
		detail: {
			description: 'Check the health of the API',
		},
		response: HealthzModel.RESPONSE_SCHEMA,
	});
