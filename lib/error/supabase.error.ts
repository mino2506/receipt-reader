export type SupabaseInfraError =
	| { _tag: "SupabaseInitError"; cause: unknown }
	| { _tag: "SupabaseClientError"; cause: unknown };

export type SupabaseSessionExchangeError = {
	_tag: "ExchangeCodeError";
	cause: unknown;
};

export type SupabaseGetUserError =
	| { _tag: "AuthGetUserError"; message: string }
	| { _tag: "AuthNoUserFound" };

export type SupabaseTaggedError =
	| SupabaseInfraError
	| SupabaseSessionExchangeError
	| SupabaseGetUserError;
