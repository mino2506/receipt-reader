import { Effect } from "effect";

export type JsonParseError = { _tag: "JsonParseError"; cause: unknown };

export const parseJson = (
	jsonString: string,
): Effect.Effect<unknown, JsonParseError, never> =>
	Effect.try({
		try: () => JSON.parse(jsonString),
		catch: (cause): JsonParseError => ({
			_tag: "JsonParseError",
			cause,
		}),
	});
