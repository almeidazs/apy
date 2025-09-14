import { ErrorCode } from './code';

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
	//#region Globals
	[ErrorCode.InternalServerError]: 'Internal Server Error',
	[ErrorCode.InvalidJSONBody]: 'Invalid JSON Body',
	[ErrorCode.UnknownRoute]: 'Unknown route or method',
	[ErrorCode.InvalidFileType]: 'Invalid file type',
	[ErrorCode.InvalidContentType]:
		'Invalid content type, expected "application/json"',
	//#endregion

	//#region Sessions (auth-based)
	[ErrorCode.UnknownAuth]: 'Unknown auth',
	[ErrorCode.UnknownSession]: 'Unknown session',
	[ErrorCode.ExpiredSession]: 'Session expired or invalid',
	[ErrorCode.InvalidAuth]: 'Invalid auth',
	[ErrorCode.PasswordMismatch]: 'Password mismatch',
	[ErrorCode.CodeExpired]: 'Code already expired',
	[ErrorCode.InvalidCode]: 'Unknown or invalid code',
	[ErrorCode.EmailUnavailable]: 'Email already taken',
	[ErrorCode.CodeAlreadyGenerated]: 'Code for this email already generated',
	//#endregion
};
