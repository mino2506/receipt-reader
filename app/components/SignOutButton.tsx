"use client";

import { signOut } from "@/utils/supabase/auth";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
	const router = useRouter();

	const handleSignOut = async () => {
		const { error } = await signOut();
		if (error) {
			console.error("Sign out error:", error);
			return;
		}
		router.push("/signin");
	};

	return (
		<button type="button" onClick={handleSignOut}>
			サインアウト
		</button>
	);
}
