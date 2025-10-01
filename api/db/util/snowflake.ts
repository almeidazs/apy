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

export const genSnow = () => {
	let timestamp = BigInt(Date.now());

	if (timestamp === lastTimestamp) {
		sequence = (sequence + 1n) & maxSequence;

		if (sequence === 0n) timestamp = lastTimestamp + 1n;
	} else sequence = 0n;

	lastTimestamp = timestamp;

	return (
		((timestamp - EPOCH) << (workerBits + sequenceBits)) |
		(workerId << sequenceBits) |
		sequence
	);
};
