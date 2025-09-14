import type { app } from '@/app';
import { HealthzService } from './service';

export const route = (elysia: typeof app) =>
	elysia.get('/healthz', ({ readyAt }) => HealthzService.get({ readyAt }));
