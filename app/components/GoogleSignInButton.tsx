// app/components/GoogleSignInButton.tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GoogleSignInButton() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);

	const handleGoogleSignIn = async () => {
		setError(null);

		const supabase = createClient();
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/dashboard`, // ログイン後のリダイレクト先
			},
		});

		if (error) {
			console.error("Googleログインエラー:", error.message);
			setError(error.message);
		}
	};

	return (
		<>
			<button
				type="button"
				onClick={handleGoogleSignIn}
				className="border px-4 py-2 rounded"
			>
				Googleでサインイン
			</button>
			{error && <p style={{ color: "red" }}>{error}</p>}
		</>
	);
}
