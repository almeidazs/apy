import { t } from 'elysia';

export namespace HealthzModel {
	export interface GetOptions {
		readyAt: number;
	}

	const STATUS_SCHEMA = t.Object({
		start: t.Number({
			description: 'Timestamp when the fetch started',
		}),
		timestamp: t.Number({
			description: 'Timestamp when the fetch ended',
		}),
	});

	export const RESPONSE_SCHEMA = t.Object({
		uptime: t.Number({
			description: 'Uptime in milliseconds of the API',
		}),
		readyAt: t.Number({
			description: 'Timestamp when the API started',
		}),
		cache: STATUS_SCHEMA,
		database: STATUS_SCHEMA,
	});
}
