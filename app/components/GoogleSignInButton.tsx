"use client";

import { signInWithGoogle } from "@/utils/supabase/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GoogleSignInButton() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);

	const handleGoogleSignIn = async () => {
		setError(null);
		const { error } = await signInWithGoogle(
			`${window.location.origin}/dashboard`,
		);
		if (error) {
			setError(error.message);
		}
	};

	return (
		<button
			type="button"
			onClick={handleGoogleSignIn}
			className="flex items-center justify-center w-full px-4 py-2 text-gray-600 border rounded-lg shadow-sm bg-white hover:bg-gray-100"
		>
			<Image
				src="/google-logo.svg"
				alt="Google Logo"
				width={20}
				height={20}
				className="mr-2"
			/>
			Googleでサインイン
		</button>
	);
}
