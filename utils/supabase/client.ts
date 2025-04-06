// utils/supabase/client.ts

import { createBrowserClient } from "@supabase/ssr";

/**
 * ブラウザ側での操作用のSupabaseクライアントを作成します
 * @returns プロジェクトの環境変数で構成されたSupabaseブラウザクライアントを返します
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs?queryGroups=router&router=app
 */
export const createClient = () => {
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL || "",
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
	);
};
