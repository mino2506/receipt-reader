import type { ApiErrorResponse } from "@/lib/api/common.schema";
import { createClient as createServerClient } from "@/lib/supabase/client.server";
import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function getUser(): Promise<
	NextResponse<ApiErrorResponse> | User
> {
	const supabase = await createServerClient();
	console.log("Supabase client created");
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	console.log("User:", JSON.stringify(user));
	console.log("Error:", JSON.stringify(error));

	if (error) {
		return NextResponse.json<ApiErrorResponse>(
			{
				success: false,
				error: {
					code: "auth_user_fetch_failed",
					message: "認証ユーザー情報の取得に失敗しました",
					field: "auth",
				},
			},
			{ status: 500 },
		);
	}
	if (!user) {
		return NextResponse.json<ApiErrorResponse>(
			{
				success: false,
				error: {
					code: "auth_user_fetch_failed",
					message: "認証ユーザー情報の取得に失敗しました",
					field: "auth",
				},
			},
			{ status: 500 },
		);
	}

	return user;
}
