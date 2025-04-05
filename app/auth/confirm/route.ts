// app/auth/confirm/route.ts

import { createClient } from "@/utils/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

// GETメソッドでメールリンクからアクセスされたときに実行
// アクセスされたURL（例：https://your-app.com/auth/confirm?token_hash=xxx&type=email）
export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url); // アクセスされたURL

	const token_hash = searchParams.get("token_hash");
	const type = searchParams.get("type") as EmailOtpType | null;

	const next = searchParams.get("next") ?? "/dashboard"; // next param ＝ リダイレクト先 なければ /dashboard

	if (token_hash && type) {
		const supabase = await createClient();

		// 一時トークンを使ってログイン状態にする
		const { error } = await supabase.auth.verifyOtp({
			type,
			token_hash,
		});

		if (!error) {
			return redirect(next);
		}
	}

	return redirect("/error");
}
