import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

/**
 * API Route 用 Supabaseクライアント作成
 */
export function createApiClient(req: NextRequest, res: NextResponse) {
	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL || "",
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
		{
			cookies: {
				getAll() {
					return req.cookies.getAll();
				},
				setAll(cookiesToSet) {
					for (const cookie of cookiesToSet) {
						res.cookies.set(cookie.name, cookie.value, cookie.options);
					}
				},
			},
		},
	);
}
