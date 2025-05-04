import { SupabaseService } from "@/lib/services/supabase/supabaseService";
import { Effect } from "effect";

export type SupabaseTaggedError =
	| { _tag: "SupabaseClientError"; cause: unknown }
	| { _tag: "AuthGetUserError"; message: string }
	| { _tag: "AuthNoUserFound" };

export const getSupabaseUser = () =>
	Effect.gen(function* (_) {
		const { supabase } = yield* _(SupabaseService);

		const { data, error } = yield* _(
			Effect.tryPromise({
				try: () => supabase.auth.getUser(),
				catch: (cause) => ({ _tag: "SupabaseClientError" as const, cause }),
			}),
		);

		if (error) {
			return yield* _(
				Effect.fail({
					_tag: "AuthGetUserError" as const,
					message: error.message,
				}),
			);
		}

		if (!data.user) {
			return yield* _(
				Effect.fail({
					_tag: "AuthNoUserFound" as const,
				}),
			);
		}
		return data.user;
	});
