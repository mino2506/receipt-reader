"use client";

import SignOutButton from "@/app/components/SignOutButton";
import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function DashboardPage() {
	const supabase = createBrowserClient();
	const [session, setSession] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// セッション取得
		const fetchSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setSession(session);
			setLoading(false);
		};

		fetchSession();

		// 認証状態変化の監視
		const { data: authListener } = supabase.auth.onAuthStateChange(
			(event, session) => {
				console.log("onAuthStateChange:", event, session);
				setSession(session);
			},
		);

		return () => {
			authListener.subscription.unsubscribe();
		};
	}, [supabase]);

	if (loading) {
		return <div>読み込み中...</div>;
	}

	if (!session) {
		return (
			<div>
				<p>サインインしてください。</p>
			</div>
		);
	}

	return (
		<div>
			<SignOutButton />
			<h1>ダッシュボード</h1>
			<p>ようこそ、{session.user.email} さん！</p>
		</div>
	);
}
