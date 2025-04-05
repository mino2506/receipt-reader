// app/private/page.tsx

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function PrivatePage() {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getUser(); // 毎回サーバーに確認されるので信頼できる

	if (error || !data?.user) {
		redirect("/login"); // 未ログインならリダイレクト
	}

	return <p>ようこそ {data.user.email} さん</p>;
}
