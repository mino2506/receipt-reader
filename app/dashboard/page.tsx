// app/dashboard/page.tsx

"use client";
import { useSession } from "@/context/useSession";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import SignOutButton from "@/app/components/SignOutButton";
import ReceiptImage from "@/app/ocr/receipt/receiptImage/page";

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
			<div className="w-screen h-screen flex flex-col items-center p-3 bg-gray-100">
				<div className="flex-wrap m-3 bg-gray-500 max-w-full break-words">
					ようこそ、{session.user.email} さん！aaaaaaaaaaaaaaaaaaa
				</div>
				<AllReceipts />
				<ReceiptImage />
				<SignOutButton />
			</div>
		);
	}

	return <p>リダイレクト中...</p>;
}

import { trpc } from "@/lib/trpc/client";

function AllReceipts() {
	const { data, isLoading, error } = trpc.getMyReceipts.useQuery({ limit: 10 });

	if (isLoading) return <div>読み込み中...</div>;
	if (error) return <div>エラー: {error.message}</div>;

	return (
		<div className="flex flex-col items-center justify-center w-max-full">
			<h1 className="text-xl font-bold m-4">📝マイレシート一覧</h1>
			<table>
				<thead>
					<tr>
						<th className="px-4 py-2">Id</th>
						<th className="px-4 py-2">Total Price</th>
						<th className="px-4 py-2">Updated At</th>
						<th className="px-4 py-2">Details Count</th>
					</tr>
				</thead>
				<tbody>
					{data?.map((r) => (
						<tr key={r.id}>
							<td className="border px-4 py-2">{r.id}</td>
							<td className="border px-4 py-2">{r.totalPrice}</td>
							<td className="border px-4 py-2">{r.updatedAt}</td>
							<td className="border px-4 py-2">{r.receiptDetails.length}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
