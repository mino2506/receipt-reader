import { getSession } from "@/utils/supabase/auth";
import SignOutButton from "../components/SignOutButton";

export default async function DashboardPage() {
	const session = await getSession();
	console.log("session", session);

	if (!session) {
		return (
			<div>
				<h1>ダッシュボード</h1>
				<p>サインインしてください。</p>
			</div>
		);
	}

	return (
		<div>
			<SignOutButton />
			<h1>ダッシュボード</h1>
			<p>ようこそ、{session.user.email} さん！</p>
			<pre>{JSON.stringify(session, null, 2)}</pre>
		</div>
	);
}
