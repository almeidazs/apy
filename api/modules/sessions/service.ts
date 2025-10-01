import { redis } from 'bun';
import { getCredentials, hashRefreshToken } from '@/config/auth';
import { prisma } from '@/db';
import { genSnow } from '@/db/util/snowflake';
import { ErrorCode } from '@/shared/errors/code';
import { exception } from '@/shared/errors/exception';
import type { SessionModel } from './model';

export class SessionService {
	public static async genCode({ email }: SessionModel.GenCodeBody) {
		const isEmailTaken = await prisma.users.findUnique({
			where: { email },
			select: { id: true },
		});

		if (isEmailTaken)
			throw exception('Bad Request', ErrorCode.EmailUnavailable);

		const REDIS_KEY = `codes:${email}`;

		const isCodeGenerated = await redis.exists(REDIS_KEY);

		if (isCodeGenerated)
			throw exception('Bad Request', ErrorCode.CodeAlreadyGenerated);

		const FIVE_MIN_IN_SEC = 300;
		const code = Math.random().toString(36).slice(2, 10).toUpperCase();

		await redis.set(REDIS_KEY, code, 'EX', FIVE_MIN_IN_SEC);

		return {
			code,
		};
	}

	public static async signUp({
		code,
		email,
		password,
	}: SessionModel.SignUpBody) {
		const REDIS_KEY = `codes:${email}`;

		const emailCode = await redis.get(REDIS_KEY);

		if (!emailCode) throw exception('Not Found', ErrorCode.CodeExpired);
		if (code !== emailCode)
			throw exception('Bad Gateway', ErrorCode.InvalidCode);

		const id = genSnow();
		const { hash, access, refresh } = getCredentials({ id });

		const SEVEN_DAYS_LATER = new Date(Date.now() + 6.048e8);

		await Promise.all([
			prisma.users.create({
				data: {
					id,
					email,
					sessions: {
						create: {
							hash,
							id: genSnow(),
							expiresAt: SEVEN_DAYS_LATER,
						},
					},
					password: await Bun.password.hash(password, 'bcrypt'),
				},
				select: { id: true },
			}),
			redis.del(REDIS_KEY),
		]);

		return {
			user: {
				id: String(id),
			},
			session: {
				access,
				refresh,
			},
		};
	}

	public static async signIn({ email, password }: SessionModel.SignInBody) {
		const user = await prisma.users.findUnique({
			where: { email },
			select: { id: true, password: true },
		});

		if (!user) throw exception('Not Found', ErrorCode.UnknownSession);

		const isPasswordMatch = await Bun.password.verify(
			password,
			user.password,
			'bcrypt',
		);

		if (!isPasswordMatch)
			throw exception('Bad Request', ErrorCode.PasswordMismatch);

		const MAX_SESSIONS_PER_USER = 10;
		const SEVEN_DAYS_LATER = new Date(Date.now() + 6.048e8);

		const { id: userId } = user;

		const { hash, access, refresh } = getCredentials({ id: userId });

		await prisma.$transaction([
			prisma.sessions.deleteMany({
				where: {
					userId,
				},
				limit: MAX_SESSIONS_PER_USER,
			}),
			prisma.sessions.create({
				data: {
					hash,
					userId,
					id: genSnow(),
					expiresAt: SEVEN_DAYS_LATER,
				},
				select: { id: true },
			}),
		]);

		return {
			session: {
				access,
				refresh,
			},
			user: {
				id: String(userId),
			},
		};
	}

	public static async signOut({ token }: SessionModel.SignOutOptions) {
		if (!token) throw exception('Unauthorized', ErrorCode.UnknownAuth);

		await prisma.sessions.delete({
			where: {
				hash: hashRefreshToken(token),
			},
			select: { id: true },
		});
	}

	public static async sweep({
		limit,
		userId,
	}: SessionModel.SweepCredentialsOptions) {
		return await prisma.sessions.deleteMany({
			limit,
			where: {
				userId,
				expiresAt: { lte: new Date() },
			},
		});
	}

	public static async list({ userId }: SessionModel.ListOptions) {
		const MAX_SESSIONS_PER_USER = 10;

		const sessions = await prisma.sessions.findMany({
			where: { userId },
			orderBy: { id: 'asc' },
			take: MAX_SESSIONS_PER_USER,
			select: { id: true, expiresAt: true },
		});

		return sessions.map(({ id, expiresAt }) => ({ expiresAt, id: String(id) }));
	}
}
