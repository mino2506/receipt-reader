// app/components/SignOutButton.tsx

"use client";

import { signOut } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
	const router = useRouter();

	const handleSignOut = async () => {
		const { error } = await signOut();

		if (error) {
			console.error("サインアウト失敗:", error.message);
			return;
		}

		router.push("/login");
	};

	return (
		<div className="w-full max-w-xs mx-auto m-3">
			<button
				type="button"
				onClick={handleSignOut}
				className="flex items-center justify-center h-11 w-full px-4 py-2 text-gray-600 border rounded-lg shadow-sm bg-white hover:bg-gray-100"
			>
				<span className="font-bold">サインアウト</span>
			</button>
		</div>
	);
}
