// app/auth/callback/route.ts

import { createInitialSubscription } from "@/lib/flow/createInitialSubscription";
import type { UserId } from "@/lib/model/user/user.schema";
import { PrismaServiceLayer } from "@/lib/services/prismaService";
import { exchangeCodeForSessionEffect } from "@/lib/services/supabase/exchangeCodeForSessionEffect";
import { getSupabaseUser } from "@/lib/services/supabase/getSupabaseUser";
import { SupabaseServiceLayer } from "@/lib/services/supabase/supabaseService";
import { saveUser } from "@/lib/services/supabase/upsertUser";
import { debug, log } from "@/lib/utils/log";
import { Effect, pipe } from "effect";
import { runPromise } from "effect/Effect";
import { type NextRequest, NextResponse } from "next/server";

/**
 * OAuth 認証後に Supabase のセッションを確立し、指定の `next` へリダイレクトする
 *
 * @param request - 認証コード付きのリクエスト。URL パラメータに `code` と任意の `next` を含む
 * @returns - 認証後に `next` パラメータの URL にリダイレクト
 *
 * @example
 * // Google OAuth のリダイレクト先として /auth/callback?code=xyz&next=/dashboard を指定
 * // セッションが確立された後、自動的に /dashboard にリダイレクトされる
 */
export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url);
	const origin = requestUrl.origin;
	const next = requestUrl.searchParams.get("next") ?? "/dashboard";
	const code = requestUrl.searchParams.get("code");

	console.log("🧁🍪🍫🎂🍭🍰🍬🍩🍧");
	console.log("GET: ", "/auth/callback/route.ts");
	console.log("[auth/callback] requestUrl.href: ", requestUrl.href);
	console.log("[auth/callback] origin: ", origin);
	console.log("[auth/callback] next: ", next);
	console.log("[auth/callback] code: ", code);
	console.log("\n");

	if (code) {
		try {
			await runPromise(
				pipe(
					exchangeCodeForSessionEffect(code),
					Effect.flatMap(() => getSupabaseUser()),
					Effect.tap((user) => saveUser(user)),
					Effect.tap((user) => ensureSubscriptionExists(user.id as UserId)),
					Effect.provide(SupabaseServiceLayer),
					Effect.provide(PrismaServiceLayer),
				),
			);
		} catch (e) {
			console.error("❌ 認証フロー失敗:", e);
		}
	}

	return NextResponse.redirect(`${origin}${next}`);
}

import type { GetActiveSubscriptionError } from "@/lib/error/subscription.error";
import { getActiveSubscription } from "@/lib/flow/getActiveSubscription";
import type { PrismaService } from "@/lib/services/prismaService";
import { hasTag } from "@/lib/utils/match";
import { Option } from "effect";

const isRecordNotFound = hasTag("RecordNotFound");

const ensureSubscriptionExists = (
	userId: UserId,
): Effect.Effect<void, GetActiveSubscriptionError, PrismaService> =>
	Effect.gen(function* (_) {
		const existing = yield* _(
			getActiveSubscription(userId),
			Effect.map(() => Option.some(true)),
			Effect.catchAll((err) =>
				isRecordNotFound(err)
					? Effect.succeed(Option.none())
					: Effect.fail(err),
			),
		);

		if (Option.isNone(existing)) {
			yield* _(createInitialSubscription(userId));
		}
	});
