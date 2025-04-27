// app/dashboard/page.tsx

"use client";
import { useSession } from "@/context/useSession";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import SignOutButton from "@/app/components/SignOutButton";
import ReceiptImage from "@/app/receipt/receiptImage/page";
import AllReceiptsTable from "@/app/receipt/table/page";

export default function Dashboard() {
	const router = useRouter();
	const { session, loading } = useSession();

	useEffect(() => {
		if (!loading && !session) {
			router.replace("/login");
		}
	}, [session, router, loading]);

	if (loading) return <div>読み込み中...</div>;

	if (session) {
		return (
			<div className="w-full flex flex-col items-center p-1 bg-background">
				<AllReceiptsTable />
				<ReceiptImage />
				<SignOutButton />
			</div>
		);
	}

	return <p>リダイレクト中...</p>;
}
