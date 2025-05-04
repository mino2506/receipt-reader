import { Effect, pipe } from "effect";

export const log =
	(label: string) =>
	<T>(value: T): Effect.Effect<T> =>
		pipe(
			Effect.sync(() => console.log(`${label}:`, value)),
			Effect.map(() => value),
		);

export const debug = (msg: string) =>
	Effect.tap((v) =>
		Effect.sync(() => {
			if (process.env.NODE_ENV !== "production") {
				console.debug(msg, v);
			}
		}),
	);
