// "use client";

// import { createClient } from "@/utils/supabase/client";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";

// export default function AuthCallback() {
// 	const router = useRouter();
// 	const searchParams = useSearchParams();
// 	const [executed, setExecuted] = useState(false); // ✅ 一度だけ実行

// 	useEffect(() => {
// 		// searchParamsがまだ初期化されてない場合はスキップ
// 		if (executed || !searchParams) return;

// 		const code = searchParams.get("code");
// 		const next = searchParams.get("next") ?? "/dashboard";

// 		// ✅ codeが取れるまで待つ
// 		if (!code) return;

// 		const run = async () => {
// 			setExecuted(true); // ✅ 実行済みマーク
// 			const supabase = createClient();
// 			const { error } = await supabase.auth.exchangeCodeForSession(code);
// 			if (error) {
// 				console.error("exchangeCodeForSession failed:", error.message);
// 				router.replace("/auth/error");
// 				return;
// 			}
// 			router.replace(next);
// 		};

// 		run();
// 	}, [searchParams, executed, router]);

// 	return <p>ログイン処理中...</p>;
// }
