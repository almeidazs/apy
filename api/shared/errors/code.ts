export enum ErrorCode {
	//#region Globals
	InternalServerError = 1001,
	InvalidJSONBody,
	UnknownRoute,
	InvalidFileType,
	InvalidContentType,
	//#endregion

	//#region Sessions (auth-based)
	UnknownAuth = 2001,
	UnknownSession,
	ExpiredSession,
	InvalidAuth,
	PasswordMismatch,
	CodeExpired,
	InvalidCode,
	CodeAlreadyGenerated,
	EmailUnavailable,
	//#endregion
}
