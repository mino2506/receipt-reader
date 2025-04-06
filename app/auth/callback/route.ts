// app/auth/callback/route.ts

import { createClient as createServerClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url);
	const origin = requestUrl.origin;
	const next = requestUrl.searchParams.get("next") ?? "/dashboard";
	const code = requestUrl.searchParams.get("code");

	console.log("🍪🍩🎂🍰🍫🍬🍭");
	console.log("RUNNING: app/auth/callback/route.ts");
	console.log("requestUrl: ", requestUrl);
	console.log("origin: ", origin);
	console.log("next: ", next);
	console.log("code: ", code);

	if (code) {
		const supabase = await createServerClient();

		await supabase.auth.exchangeCodeForSession(code);
	}

	return NextResponse.redirect(`${origin}${next}`);
}
