// app/components/SignOutButton.tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
	const router = useRouter();

	const handleSignOut = async () => {
		const supabase = createClient();
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error("サインアウトエラー:", error.message);
			return;
		}
		router.push("/login"); // ログアウト後はログイン画面へ
	};

	return (
		<button type="button" onClick={handleSignOut}>
			サインアウト
		</button>
	);
}
