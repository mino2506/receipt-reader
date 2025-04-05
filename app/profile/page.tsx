// app/profile/page.tsx
import { createClient as createServerClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
	const supabase = await createServerClient();

	// サーバー側でセッションを取得
	const {
		data: { session },
	} = await supabase.auth.getSession();

	// 未ログイン → /signin にリダイレクト（ログイン後に戻って来られるよう next パラメータ付き）
	if (!session) {
		redirect("/signin?next=/profile");
	}

	const { user } = session;

	return (
		<div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
			<h1 className="text-2xl font-bold mb-4">プロフィール</h1>
			<ul className="space-y-2">
				<li>
					<strong>メール:</strong> {user.email}
				</li>
				<li>
					<strong>ユーザーID:</strong> {user.id}
				</li>
				<li>
					<strong>最終ログイン:</strong>{" "}
					{new Date(user.last_sign_in_at ?? "").toLocaleString()}
				</li>
			</ul>
		</div>
	);
}
