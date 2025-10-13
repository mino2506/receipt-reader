// app/dashboard/page.tsx

"use client";
import { useSession } from "@/context/useSession";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import AllReceiptsTable from "@/app/dashboard/receipts/table/page";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
	const router = useRouter();
	const { session, loading } = useSession();

	useEffect(() => {
		if (!loading && !session) {
			router.replace("/login");
		}
	}, [session, router, loading]);

	if (loading) return <div>読み込み中...</div>;

	const env = process.env.NODE_ENV;

	if (session) {
		return (
			<div className="w-full flex flex-col items-center p-1 bg-background">
				{env === "development" && (
					<Button
						onClick={async () => {
							const res = await fetch("http://localhost:3001/test");
							// const res = await fetch("http://127.0.0.1:3001/test");
							const json = await res.json();
							alert(JSON.stringify(json, null, 2));
						}}
					>
						Fetch Local Server
					</Button>
				)}
				<AllReceiptsTable />
			</div>
		);
	}

	return <p>リダイレクト中...</p>;
}
