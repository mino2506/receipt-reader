// app/auth/confirm/route.ts

import { createClient as createServerClient } from "@/lib/supabase/client.server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

/**
 * メールリンク認証の確認用エンドポイント。トークンを検証し、成功時は指定画面にリダイレクトする
 *
 * @param request - メールリンクからアクセスされたリクエスト。URL に `token_hash`, `type`, `next` を含む
 * @returns - 認証成功時は `next` に、失敗時は `/error` にリダイレクト
 *
 * @example
 * // メール内リンク: /auth/confirm?token_hash=abc123&type=email&next=/dashboard
 * // 認証成功時 → /dashboard に遷移、失敗時 → /error に遷移
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  console.log("🧈🍞🥐🥨🧇🥯🥖🫓🧀");
  console.log("GET: ", "/auth/confirm/route.ts");

  if (token_hash && type) {
    console.log("token_hash:", token_hash);
    console.log("type:", type);
    const supabase = await createServerClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      console.log("Email confirmation successful");
      // redirect user to specified redirect URL or root of app
      redirect(next);
    }
  }
  // redirect the user to an error page with some instructions
  redirect("/error");
}
