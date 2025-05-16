// app/auth/callback/route.ts

import { parseUserId } from "@/lib/_domain/user/parseUser";
import { ensureSubscriptionExists } from "@/lib/_flow/ensureSubscriptionExists";
import { PrismaServiceLayer } from "@/lib/_services/prismaService";
import { exchangeCodeForSessionEffect } from "@/lib/_services/supabase/exchangeCodeForSessionEffect";
import { getSupabaseUser } from "@/lib/_services/supabase/getSupabaseUser";
import { SupabaseServiceLayer } from "@/lib/_services/supabase/supabaseService";
import { saveUser } from "@/lib/_services/supabase/upsertUser";
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
		await runPromise(
			pipe(
				exchangeCodeForSessionEffect(code),
				Effect.flatMap(() => getSupabaseUser()),
				Effect.tap((user) => saveUser(user)),
				Effect.tap((user) => Effect.log(`User saved: ${user}`)),
				Effect.flatMap((user) => parseUserId(user.id)),
				Effect.tap((userId) => Effect.log(`UserId parsed: ${userId}`)),
				Effect.tap((userId) => ensureSubscriptionExists(userId)),
				Effect.tap((userId) => Effect.log(`Subscription ensured: ${userId}`)),
				Effect.provide(SupabaseServiceLayer),
				Effect.provide(PrismaServiceLayer),
				Effect.matchEffect({
					onSuccess: () => Effect.log("🎉 認証処理 完了"),
					onFailure: (e) => Effect.logError("❌ 認証フロー失敗:", e),
				}),
			),
		);
	}

	return NextResponse.redirect(`${origin}${next}`);
}
