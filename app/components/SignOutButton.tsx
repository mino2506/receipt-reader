// app/components/SignOutButton.tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
	const router = useRouter();

	const handleSignOut = async () => {
		const supabase = createClient();

		// ✅ セッション削除
		const { error } = await supabase.auth.signOut();

		if (error) {
			console.error("サインアウト失敗:", error.message);
			return;
		}

		// ✅ サインアウト後はログインページへリダイレクト
		router.push("/login");
	};

	return (
		<button type="button" onClick={handleSignOut}>
			サインアウト
		</button>
	);
}
