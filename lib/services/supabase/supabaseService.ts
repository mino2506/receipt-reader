import type { SupabaseInfraError } from "@/lib/error/supabase.error";
import { createClient as createServerClient } from "@/lib/supabase/client.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Context, Effect, Layer } from "effect";

export class SupabaseService extends Context.Tag("SupabaseService")<
	SupabaseService,
	{ supabase: SupabaseClient }
>() {}

const toSupabaseInfraError = (e: unknown): SupabaseInfraError =>
	({ _tag: "SupabaseInitError", cause: e }) satisfies SupabaseInfraError;

const makeSupabaseService = Effect.tryPromise({
	try: async () => ({ supabase: await createServerClient() }),
	catch: toSupabaseInfraError,
});

export const SupabaseServiceLayer = Layer.effect(
	SupabaseService,
	makeSupabaseService,
);
