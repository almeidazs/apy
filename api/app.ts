import { env } from '@/env';
import { createApp } from '@/http/createApp';
import { prisma } from './db';
import { route } from './http/route';

export const app = createApp();

await route(app);

app.listen(env.PORT, async ({ port, hostname }) => {
	console.debug(`🤌 ${env.APP_NAME} is ready at ${hostname}:${port}`);

	app.decorator.readyAt = Date.now();

	await prisma.$connect();

	console.debug('Prisma Database is ready');
});
