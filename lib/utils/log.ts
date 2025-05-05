import { Effect, pipe } from "effect";

export const log = <T>(label: string) =>
	Effect.tap((value) => Effect.sync(() => console.log(`${label}:`, value)));

export const debug = (msg: string) =>
	Effect.tap((v) =>
		Effect.sync(() => {
			if (process.env.NODE_ENV !== "production") {
				console.debug(msg, v);
			}
		}),
	);
