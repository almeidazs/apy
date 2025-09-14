import { env } from '@/env';

export const commonHeaders = () => ({
	'x-frame-options': 'deny',
	'x-content-type-options': 'nosniff',
	'x-xss-Protection': '0',
	'cross-origin-resource-policy': 'same-origin',
	'cross-origin-opener-policy': 'same-origin',
	'cross-origin-embedder-policy': 'require-corp',
	'referrer-policy': 'no-referrer',
	'content-security-policy': "default-src 'none'",

	'cache-control': 'no-store',
	pragma: 'no-cache',

	'access-control-allow-origin': env.ORIGIN,
	'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE',
	'access-control-allow-headers': 'Content-Type, Authorization',
	'access-control-allow-credentials': 'true',
	'access-control-expose-headers': 'ETag',
});
