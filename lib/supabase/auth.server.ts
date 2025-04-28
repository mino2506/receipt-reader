import type { ApiError, ApiResponseFromType } from "@/lib/api/common.schema";
import { createClient as createServerClient } from "@/lib/supabase/client.server";
import { NextResponse } from "next/server";

export async function getUser<ApiResponseFromType>(): ApiError {
	const supabase = await createServerClient();
	console.log("Supabase client created");
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	console.log("User:", JSON.stringify(user));
	console.log("Error:", JSON.stringify(error));

	if (error) {
		return NextResponse.json<ApiError>(
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
		return NextResponse.json<ApiError>(
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

	return { user, errorResponse: null };
}
