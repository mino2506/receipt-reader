import type {
	SupabaseSessionExchangeError,
	SupabaseTaggedError,
} from "@/lib/error/supabase.error";
import { SupabaseService } from "@/lib/services/supabase/supabaseService";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Effect } from "effect";

const toExchangeCodeError = (e: unknown): SupabaseSessionExchangeError =>
	({
		_tag: "ExchangeCodeError",
		cause: e,
	}) satisfies SupabaseSessionExchangeError;

export const exchangeCodeForSessionEffect = (
	code: string,
): Effect.Effect<SupabaseClient, SupabaseTaggedError, SupabaseService> =>
	Effect.gen(function* (_) {
		const { supabase } = yield* _(SupabaseService);
		yield* _(
			Effect.tryPromise({
				try: () => supabase.auth.exchangeCodeForSession(code),
				catch: toExchangeCodeError,
			}),
		);
		return supabase;
	});
