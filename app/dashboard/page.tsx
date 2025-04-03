import { createClient as createServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
	// リクエストごとに新しいサーバークライアントを生成（最新のクッキー情報を取得）
	const supabase = await createServerClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	// サインインしていない場合の処理
	if (!session) {
		return (
			<div>
				<h1>ダッシュボード</h1>
				<p>サインインしてください。</p>
			</div>
		);
	}

	// サインインしている場合、セッション情報に基づいてコンテンツを表示
	return (
		<div>
			<h1>ダッシュボード</h1>
			<p>ようこそ、{session.user.email} さん！</p>
			<pre>{JSON.stringify(session, null, 2)}</pre>
		</div>
	);
}
