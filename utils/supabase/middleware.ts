// utils/supabase/middleware.ts

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * ミドルウェアを使用して、セッションを更新します
 * @param request リクエストオブジェクト
 * @returns セッションを更新したレスポンスを返します
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs?queryGroups=router&router=app
 */
export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	});

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL || "",
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					// biome-ignore lint/complexity/noForEach: <explanation>
					cookiesToSet.forEach(({ name, value, options }) =>
						request.cookies.set(name, value),
					);
					supabaseResponse = NextResponse.next({
						request,
					});
					// biome-ignore lint/complexity/noForEach: <explanation>
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options),
					);
				},
			},
		},
	);

	// Do not run code between createServerClient and
	// supabase.auth.getUser(). A simple mistake could make it very hard to debug
	// issues with users being randomly logged out.
	// IMPORTANT: DO NOT REMOVE auth.getUser()

	// createServerClientとsupabase.auth.getUser()の間にコードを実行しないでください。
	// 単純なミスでも、ユーザーがランダムにログアウトされる問題のデバッグが非常に困難になる可能性があります。
	// 重要: auth.getUser()を削除しないでください

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (
		!user &&
		!request.nextUrl.pathname.startsWith("/login") &&
		!request.nextUrl.pathname.startsWith("/auth")
	) {
		// no user, potentially respond by redirecting the user to the login page
		// ユーザーがいない場合、ユーザーをログインページにリダイレクトすることで応答する可能性があります
		const url = request.nextUrl.clone();
		url.pathname = "/login";
		return NextResponse.redirect(url);
	}

	// IMPORTANT: You *must* return the supabaseResponse object as it is.
	// If you're creating a new response object with NextResponse.next() make sure to:
	// 1. Pass the request in it, like so:
	//    const myNewResponse = NextResponse.next({ request })
	// 2. Copy over the cookies, like so:
	//    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
	// 3. Change the myNewResponse object to fit your needs, but avoid changing
	//    the cookies!
	// 4. Finally:
	//    return myNewResponse
	// If this is not done, you may be causing the browser and server to go out
	// of sync and terminate the user's session prematurely!

	// 重要: supabaseResponseオブジェクトをそのまま返す必要があります。
	// NextResponse.next()で新しいレスポンスオブジェクトを作成する場合は、以下の点に注意してください:
	// 1. 以下のようにrequestを渡してください:
	//    const myNewResponse = NextResponse.next({ request })
	// 2. 以下のようにクッキーをコピーしてください:
	//    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
	// 3. myNewResponseオブジェクトを必要に応じて変更しますが、クッキーは変更しないでください！
	// 4. 最後に:
	//    return myNewResponse
	// これを行わないと、ブラウザとサーバーが同期されず、ユーザーセッションが途中で終了する可能性があります！

	return supabaseResponse;
}
