import { hostname } from 'node:os';

const workerBits = 10n;
const sequenceBits = 12n;
const EPOCH = 1735771200000n; // TODO: Mudar para a data de lançamento da API

const maxSequence = (1n << sequenceBits) - 1n;

const workerId = BigInt(
	(hostname()
		.split('')
		.reduce((acc, c) => acc + c.charCodeAt(0), 0) +
		process.pid) &
		0x3ff, // 10 bits
);

let lastTimestamp = 0n;
let sequence = 0n;

export const snowflake = () => {
	const date = new Date();
	let timestamp = BigInt(date.getTime());

	if (timestamp === lastTimestamp) {
		sequence = (sequence + 1n) & maxSequence;

		if (sequence === 0n) timestamp = lastTimestamp + 1n;
	} else sequence = 0n;

	lastTimestamp = timestamp;

	return {
		createdAt: date.toISOString(),
		id:
			((timestamp - EPOCH) << (workerBits + sequenceBits)) |
			(workerId << sequenceBits) |
			sequence,
	};
};

export const getSnowTimestamp = (id: bigint) => {
	const timestamp = id >> (workerBits + sequenceBits);

	return Number(timestamp + EPOCH);
};
