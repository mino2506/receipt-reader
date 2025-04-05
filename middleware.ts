import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
	// 各リクエストごとに最新のクッキー情報を含むサーバークライアントを生成
	const supabase = await createClient();

	// Supabase の認証 API を使い、現在のセッション情報を取得
	const {
		data: { session },
	} = await supabase.auth.getSession();

	// セッションがなければサインインページへリダイレクト
	if (!session) {
		const loginUrl = new URL("/signin", req.url);
		return NextResponse.redirect(loginUrl);
	}

	// 認証済みの場合はそのまま次のハンドラーへ
	return NextResponse.next();
}

// このミドルウェアを /dashboard 以下のパスに適用
export const config = {
	matcher: ["/dashboard/:path*"],
};
