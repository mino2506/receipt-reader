// app/dashboard/page.tsx

"use client";

import SignOutButton from "@/app/components/SignOutButton";
import ReceiptImage from "@/app/ocr/receipt/receiptImage/page";
import { useSession } from "@/context/useSession";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
	const router = useRouter();
	const { session, loading } = useSession();

	// useEffect(() => {
	// 	if (!loading && !session) {
	// 		router.push("/login");
	// 	}
	// });

	if (loading) return <div>読み込み中...</div>;

	if (session) {
		return (
			<div className="w-screen h-screen flex flex-col items-center p-3 bg-gray-100">
				<div className="flex-wrap m-3 bg-gray-500 max-w-full break-words">
					ようこそ、{session.user.email} さん！aaaaaaaaaaaaaaaaaaa
				</div>
				<ReceiptImage />
				<SignOutButton />
			</div>
		);
	}
}
