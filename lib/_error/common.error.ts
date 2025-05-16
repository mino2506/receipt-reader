export type UnknownError = { _tag: "UnknownError"; cause: unknown };

export const toUnknownError = (e: unknown): UnknownError => ({
	_tag: "UnknownError",
	cause: e,
});
