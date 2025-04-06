// app/components/GoogleSignInButton.tsx

"use client";

import { signInWithGoogle } from "@/lib/supabase/auth";
import Image from "next/image";
import { useState } from "react";

export default function GoogleSignInButton() {
	const [error, setError] = useState<string | null>(null);

	const handleGoogleSignIn = async () => {
		setError(null);
		const defaultRedirect =
			process.env.NEXT_PUBLIC_DEFAULT_REDIRECT_PATH ?? "/";
		const { error } = await signInWithGoogle(
			`${window.location.origin}/auth/callback?next=${defaultRedirect}`,
		);
		if (error) {
			setError(error.message);
		}
	};

	return (
		<div className="w-full max-w-xs mx-auto m-3">
			<button
				type="button"
				onClick={handleGoogleSignIn}
				className="flex items-center justify-center h-11 w-full px-4 py-2 text-gray-600 border rounded-lg shadow-sm bg-white hover:bg-gray-100"
			>
				<div className="h-8 w-8 mr-2 relative">
					<Image
						src="/google-logo_neutral_rd_na.svg"
						alt="Google Logo"
						fill
						className="object-contain"
					/>
				</div>
				<span className="font-bold mr-1">Google</span> で ログイン
			</button>
		</div>
	);
}
