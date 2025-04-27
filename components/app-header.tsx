"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSession } from "@/context/useSession";
import { signOut } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";

export function AppHeader() {
	const router = useRouter();

	const handleLogout = async () => {
		const { error } = await signOut();

		if (error) {
			console.error("サインアウト失敗:", error.message);
			return;
		}

		router.push("/login");
	};
	const { session, loading } = useSession();

	return (
		<header className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 border-b border-border bg-background">
			<div className="flex items-start gap-4">
				<SidebarTrigger />
				<div className="text-lg font-semibold">ダッシュボード</div>
			</div>
			<div className="flex items-center gap-2">
				<Avatar>
					<AvatarImage
						src={session?.user.user_metadata.avatar_url}
						alt="Avatar"
					/>
					<AvatarFallback>
						{session?.user.user_metadata.name?.[0] ?? "U"}
					</AvatarFallback>
				</Avatar>
				<Button variant="outline" size="sm" onClick={handleLogout}>
					ログアウト
				</Button>
			</div>
		</header>
	);
}
