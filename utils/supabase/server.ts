// utils/supabase/server.ts

"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * サーバーサイドでの操作用のSupabaseクライアントを作成します
 * @returns プロジェクトの環境変数で構成されたSupabaseサーバークライアントを返します
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs?queryGroups=router&router=app
 */
export async function createClient() {
	const cookieStore = await cookies();
	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL || "",
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options),
						);
					} catch {
						// The `setAll` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing
						// user sessions.
					}
				},
			},
		},
	);
}
