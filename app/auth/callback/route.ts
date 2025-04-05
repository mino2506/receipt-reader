// app/auth/callback/route.ts
import { createClient } from "@/utils/supabase/server"; // サーバー用クライアントをインポート
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");
	// if "next" is in param, use it as the redirect URL
	const next = searchParams.get("next") ?? "/dashboard"; // デフォルトのリダイレクト先

	if (code) {
		const supabase = await createClient(); // サーバー用クライアントを作成
		const { error } = await supabase.auth.exchangeCodeForSession(code); // コードをセッションに交換
		if (!error) {
			// セッション交換成功後、指定された `next` パスまたはデフォルトパスにリダイレクト
			return NextResponse.redirect(
				`<span class="math-inline">\{origin\}</span>{next}`,
			);
		}
		console.error("Error exchanging code for session:", error.message);
	}

	// return the user to an error page with instructions
	// コード交換失敗時やコードがない場合はエラーページ等にリダイレクト
	return NextResponse.redirect(`${origin}/auth/auth-code-error`); // エラーページのパスに適宜変更してください
}
