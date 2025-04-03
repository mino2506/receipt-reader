"use client";

import { signInWithEmail, signInWithGoogle } from "@/lib/supabase/auth";
import { useState } from "react";

export default function SignInPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	// メールアドレスとパスワードによるサインイン処理
	const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const { data, error } = await signInWithEmail(email, password);
		if (error) {
			setError(error.message);
		} else {
			setError("");
			// サインイン成功時のリダイレクトなどの処理を追加する
		}
	};

	// Google OAuth を利用したサインイン処理
	const handleGoogleSignIn = async () => {
		const { data, error } = await signInWithGoogle();
		if (error) {
			setError(error.message);
		} else {
			setError("");
			// サインイン成功時のリダイレクトなどの処理を追加する
		}
	};

	return (
		<div>
			<h1>サインイン</h1>
			<form onSubmit={handleEmailSignIn}>
				<div>
					<label htmlFor="email">メールアドレス</label>
					<input
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
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
						required
					/>
				</div>
				{error && <p style={{ color: "red" }}>{error}</p>}
				<button type="submit">メールでサインイン</button>
			</form>
			<hr />
			<button type="button" onClick={handleGoogleSignIn}>
				Googleでサインイン
			</button>
		</div>
	);
}
