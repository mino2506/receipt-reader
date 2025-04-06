// utils/supabase/auth.ts

import type { Session } from "@supabase/supabase-js";
import { createClient as createBrowserClient } from "./client";
import { createClient as createServerClient } from "./server";

/**
 * クライアント側で現在の Supabase セッションを取得する
 *
 * @returns - セッションオブジェクト。未ログイン時は null
 *
 * @example
 * const session = await getClientSession();
 * if (!session) router.push("/login");
 */
export async function getClientSession(): Promise<Session | null> {
	const supabase = createBrowserClient();
	const {
		data: { session },
		error,
	} = await supabase.auth.getSession();

	if (error) {
		console.error("セッション取得エラー:", error.message);
	}

	return session;
}

/**
 * サーバー側で現在の Supabase ユーザー情報を取得する
 *
 * @returns - 認証済みユーザー。未ログイン時は null を返す
 *
 * @example
 * const user = await getUser();
 * if (!user) redirect("/login");
 */
export async function getServerUser() {
	const supabase = await createServerClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error) {
		console.error("ユーザー取得エラー:", error.message);
		return null;
	}

	return user;
}

/**
 * クライアント側でメールアドレスとパスワードによるサインインを行う
 *
 * @param email - サインイン用のメールアドレス
 * @param password - サインイン用のパスワード
 * @returns - 認証結果オブジェクト。`data.session` にセッション情報、`error` にエラー情報
 *
 * @example
 * const { data, error } = await signInWithEmail("test@example.com", "password123");
 */
export async function signInWithEmail(email: string, password: string) {
	const supabase = createBrowserClient();
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	return { data, error };
}

/**
 * クライアント側で Google OAuth によるサインインを行う
 *
 * @param redirectUrl - リダイレクト先の絶対URL（省略時は .env の既定パス）
 * @returns - Supabase の認証結果。`data.url` は OAuth 開始用のリダイレクト先。null の場合は URL の生成に失敗
 *
 * @example
 * await signInWithGoogle(); // .env の既定パスにリダイレクト
 * await signInWithGoogle("https://example.com/profile"); // 明示的に指定
 */
export async function signInWithGoogle(redirectUrl?: string) {
	const path = process.env.NEXT_PUBLIC_DEFAULT_REDIRECT_PATH ?? "/dashboard";
	const defaultRedirect = `${window.location.origin}${path}`;

	const supabase = createBrowserClient();
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
			redirectTo: redirectUrl ?? defaultRedirect,
		},
	});

	return { data, error };
}

/**
 * クライアント側で Supabase のサインアウト処理を実行する
 *
 * @returns - エラー情報。正常終了時は null、失敗時は AuthError を返す
 *
 * @example
 * const error = await signOut();
 * if (error) console.error("サインアウト失敗:", error.message);
 */
export async function signOut() {
	const supabase = createBrowserClient();
	const { error } = await supabase.auth.signOut();
	return { error };
}
