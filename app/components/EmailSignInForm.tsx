// app/components/EmailSignInButton.tsx

"use client";

import { signInWithEmail, signUpWithEmail } from "@/lib/supabase/auth";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function EmailSignInForm() {
	const router = useRouter();
	const emailRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	// 自動入力された値を useState に反映（初回レンダリング後に）
	useEffect(() => {
		setTimeout(() => {
			if (emailRef.current?.value) setEmail(emailRef.current.value);
			if (passwordRef.current?.value) setPassword(passwordRef.current.value);
		}, 100);
	}, []);

	const handleEmailSignIn = async () => {
		const { data, error } = await signInWithEmail(email, password);
		if (error) {
			// console.error("サインインエラー:", error.message);
			setError(error.message);
			return;
		}
		if (data.session) {
			router.push("/dashboard");
		}
	};

	const handleEmailSignUp = async () => {
		const { data, error } = await signUpWithEmail(email, password);
		if (error) {
			setError(error.message);
			return;
		}
		if (data.user) {
			router.push("/dashboard");
		}
	};

	return (
		<>
			<div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
				<label
					htmlFor="email"
					className="w-full max-w-sm mx-auto self-start mx-1 mt-1"
				>
					Email:
				</label>
				<input
					ref={emailRef}
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					required
					onChange={(e) => setEmail(e.target.value)}
					className="w-full max-w-sm mx-auto mx-2 my-1 p-1 rounded border border-gray-300 focus:ring focus:ring-blue-200"
				/>
				<label
					htmlFor="password"
					className="w-full max-w-sm mx-auto self-start mx-1 mt-1"
				>
					Password:
				</label>
				<input
					ref={passwordRef}
					id="password"
					name="password"
					type="password"
					autoComplete="current-password"
					required
					onChange={(e) => setPassword(e.target.value)}
					className="w-full max-w-sm mx-2 my-1 p-1 rounded border border-gray-300 focus:ring focus:ring-blue-200"
				/>
			</div>
			<div className="w-full max-w-xs mx-auto m-3">
				<button
					type="button"
					onClick={handleEmailSignIn}
					className="flex items-center justify-center h-11 w-full px-4 py-2 text-gray-600 border rounded-lg shadow-sm bg-white hover:bg-gray-100"
				>
					<span className="font-bold mr-1">E-Mail</span> で ログイン
				</button>
			</div>

			<div className="w-full max-w-xs mx-auto m-3">
				<button
					type="button"
					onClick={handleEmailSignUp}
					className="flex items-center justify-center h-11 w-full px-4 py-2 text-gray-800 border rounded-lg shadow-sm bg-red-400 hover:bg-red-300"
				>
					<span className="font-bold">E-Mail で 登録</span>
				</button>
			</div>
			<div className="w-full max-w-sm mx-auto my-3 flex align-center justify-center">
				<span className="text-red-700">
					{error ? JSON.stringify(error).replaceAll('"', "") : ""}
				</span>
			</div>
		</>
	);
}
