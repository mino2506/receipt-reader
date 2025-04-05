import { createClient } from "./server";

import { createClient as createBrowserClient } from "./client";
import { createClient as createServerClient } from "./server";

export async function getSession() {
	// リクエストごとにサーバークライアントを生成
	const supabase = await createClient();
	// 現在のセッション情報を取得
	const {
		data: { session },
		error,
	} = await supabase.auth.getSession();

	if (error) {
		console.error("セッション取得エラー:", error.message);
		return null;
	}

	return session;
}

/**
 * クライアント側でメールアドレスとパスワードによるサインインを行う
 * @param email ユーザーのメールアドレス
 * @param password ユーザーのパスワード
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
 * クライアント側でGoogle OAuth経由のサインインを行う
 * @param redirectTo サインイン完了後にリダイレクトするURL（任意）
 */
export async function signInWithGoogle(redirectUrl: string) {
	const supabase = createBrowserClient();
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
			redirectTo: redirectUrl,
		},
	});

	return { data, error };
}

/**
 * クライアント側でのサインアウト処理
 */
export async function signOut() {
	const supabase = createBrowserClient();
	const { error } = await supabase.auth.signOut();
	return error;
}

/**
 * サーバー側でのサインアウト処理（必要に応じて）
 * ※通常はクライアント側のサインアウトで十分ですが、サーバーからセッションを削除したい場合に利用
 */
// export async function signOutServer() {
// 	const supabase = await createServerClient();
// 	const { error } = await supabase.auth.signOut();
// 	return error;
// }
