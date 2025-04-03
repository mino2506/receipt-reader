"use client";

import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function SignInForm() {
	// シングルトンのクライアントコンポーネント用 Supabase クライアントを生成
	const supabase = createBrowserClient();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// Supabase の認証 API を呼び出してサインイン
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) {
			setError(error.message);
		} else {
			// サインイン成功時の処理（例：リダイレクト）
			setError("");
			// リダイレクト例：window.location.href = "/dashboard";
		}
	};

	return (
		<form onSubmit={handleSignIn}>
			<div>
				<label htmlFor="email">メールアドレス</label>
				<input
					id="email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="your-email@example.com"
					required
				/>
			</div>
			<div>
				<label htmlFor="password">パスワード</label>
				<input
					id="password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="パスワード"
					required
				/>
			</div>
			{error && <p style={{ color: "red" }}>{error}</p>}
			<button type="submit">サインイン</button>
		</form>
	);
}
