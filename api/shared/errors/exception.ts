import { status as genStatus, type StatusMap } from 'elysia';
import type { ErrorCode } from './code';
import { ERROR_MESSAGES } from './messages';

export const exception = (
	status: keyof StatusMap,
	code: ErrorCode,
	errors?: unknown,
) => genStatus(status, { code, errors, message: ERROR_MESSAGES[code] });
