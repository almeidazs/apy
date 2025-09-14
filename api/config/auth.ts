import { createHash, randomBytes } from 'node:crypto';
import { Parse } from '@sinclair/typebox/value';
import { t } from 'elysia';
import { createSigner, createVerifier } from 'fast-jwt';
import { env } from '@/env';

const { JWT_SECRET: key } = env;

const sign = createSigner({
	key,
	expiresIn: '15m',
});

const verifier = createVerifier({
	key,
});

const AUTH_SCHEMA = t.Object({
	id: t.Transform(t.String()).Decode(BigInt).Encode(String),
});

export const verify = (token: string) => {
	const value = verifier(token);

	try {
		return Parse(AUTH_SCHEMA, value);
	} catch {}
};

interface GenerateAuthOptions {
	id: bigint;
}

const generateAccessToken = (data: GenerateAuthOptions) => {
	// @ts-expect-error
	data.id = String(data.id);

	return sign(data);
};

const generateRefreshToken = () => {
	const refresh = randomBytes(40).toString('hex');

	return {
		refresh,
		hash: hashRefreshToken(refresh),
	};
};

export const hashRefreshToken = (token: string) => {
	return createHash('sha256').update(token).digest('hex');
};

export const getCredentials = (data: GenerateAuthOptions) => ({
	...generateRefreshToken(),
	access: generateAccessToken(data),
});
