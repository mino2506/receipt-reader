// app/auth/callback/route.ts

import { createClient as createServerClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

import { upsertUser } from "@/lib/supabase/upsertUser";

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
		const supabase = await createServerClient();

		await supabase.auth.exchangeCodeForSession(code);

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (user) {
			await upsertUser(user);
		}
	}

	return NextResponse.redirect(`${origin}${next}`);
}
