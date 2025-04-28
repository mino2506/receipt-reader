// app/page.tsx
import { createClient as createServerClient } from "@/lib/supabase/client.server";
import { redirect } from "next/navigation";

import Dashboard from "./dashboard/page";

export default async function Home() {
	const supabase = await createServerClient();
	const { data } = await supabase.auth.getUser();

	if (data.user) {
		redirect("/dashboard");
	}
	redirect("/login");

	return (
		<div>
			<Dashboard />
		</div>
	);
}
