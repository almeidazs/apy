import { Parse } from '@sinclair/typebox/value';
import { t } from 'elysia';

const MAX_TCP_PORT_NUMBER = 65_535;

const ENV_SCHEMA = t.Object({
	APP_NAME: t.String({ minLength: 1 }),
	JWT_SECRET: t.String({ minLength: 40 }),
	DATABASE_URL: t.String({ format: 'uri' }),
	NODE_ENV: t.String({ default: 'development' }),
	PORT: t.Integer({ minimum: 1, maximum: MAX_TCP_PORT_NUMBER, default: 3_000 }),

	ORIGIN: t.String({ format: 'uri' }),
});

export const env = Parse(ENV_SCHEMA, Bun.env);
