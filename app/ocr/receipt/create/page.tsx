"use client";

import { createReceiptWithDetails } from "@/lib/api/receipt/actions";
import { useTransition } from "react";

export default function TestCreateReceiptPage() {
	const [isPending, startTransition] = useTransition();

	const handleSubmit = () => {
		startTransition(async () => {
			const result = await createReceiptWithDetails({
				receipt: {
					totalPrice: 1980,
					userId: "9b3472b4-9dde-72c0-8423-dbe153bb69c7", // ← supabase.auth.getUser() で上書きされるので仮でOK
				},
				details: [
					{
						itemId: "9b3472b4-9dde-72c0-8423-dbe153bb69c7", // 仮のItem ID
						amount: 2,
						unitPrice: 900,
						subTotalPrice: 1800,
						tax: 180,
						currency: "JPY",
					},
				],
			});

			if (result.success) {
				alert("✅ 登録成功！");
			} else {
				alert(`❌ 登録失敗: ${result.error.message}`);
				console.error("エラー詳細:", result.error.hint ?? result.error);
			}
		});
	};

	return (
		<main className="p-6 max-w-md mx-auto">
			<h1 className="text-xl font-bold mb-4">🧪 レシート登録テスト</h1>

			<button
				type="button"
				onClick={handleSubmit}
				disabled={isPending}
				className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
			>
				{isPending ? "送信中..." : "createReceiptWithDetails を実行"}
			</button>
		</main>
	);
}
