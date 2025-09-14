import { PrismaClient } from '@prisma/client';
import { env } from '@/env';

const isDev = env.NODE_ENV !== 'production';
const options = isDev
	? { errorFormat: 'pretty', log: ['warn', 'info', 'error', 'query'] }
	: {};

// @ts-expect-error
export const prisma = new PrismaClient(options);
