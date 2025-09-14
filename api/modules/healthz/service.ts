import { prisma } from '@/db';
import type { HealthzModel } from './model';

export abstract class HealthzService {
	public static async get({ readyAt }: HealthzModel.GetOptions) {
		return {
			readyAt,
			uptime: Date.now() - readyAt,
			...(await HealthzService.breath()),
		};
	}

	public static async breath() {
		const { count } = HealthzService;

		const [cache, database] = await Promise.all([
			count(() => Bun.redis.ping()),
			count(() => prisma.$executeRaw`SELECT 'WHATS_UP_GUYS'`),
		]);

		return {
			cache,
			database,
		};
	}

	protected static async count(func: () => unknown) {
		const start = performance.now();

		await func();

		return {
			start,
			timestamp: performance.now() - start,
		};
	}
}
