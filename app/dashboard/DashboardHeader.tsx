"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/context/useSession";

export function DashboardHeader() {
	const handleLogout = () => {
		// TODO: ログアウト処理を書く
		console.log("ログアウトしました");
	};
	const { session, loading } = useSession();

	return (
		<header className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 border-b border-border bg-background">
			<div className="text-lg font-semibold">ダッシュボード</div>
			<div className="flex items-center gap-2">
				{/* ここにユーザー情報とかもあとで追加できる */}
				{
					<img
						src={session?.user.user_metadata.avatar_url}
						alt="ユーザーのアイコン"
						className="w-8 h-8 rounded-full"
					/>
				}
				<Button variant="outline" size="sm" onClick={handleLogout}>
					ログアウト
				</Button>
			</div>
		</header>
	);
}
