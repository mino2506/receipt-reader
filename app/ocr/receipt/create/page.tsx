"use client";

import { createReceiptWithDetails } from "@/lib/api/receipt/actions";
import { useTransition } from "react";

const mockInput = {
	receipt: {
		totalPrice: 1980,
		userId: "47186933-47fa-4152-91f9-70fcf9d5247d", // SupabaseユーザーID（開発用）
	},
	details: [
		{
			item: {
				rawName: "UC 大きな ツイン シュー",
				normalized: "大きなツインシュー",
				category: "snacks",
			},
			amount: 2,
			unitPrice: 900,
			subTotalPrice: 1800,
			tax: 180,
			currency: "JPY",
		},
		{
			item: {
				rawName: "サントリー天然水 2L",
				normalized: "サントリー天然水",
				category: "drink",
			},
			amount: 1,
			unitPrice: 180,
			subTotalPrice: 180,
			tax: 18,
			currency: "JPY",
		},
	],
};

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
						item: {
							rawName: "UC 大きな ツイン シューゥゥ!! 超エキサイティン!!!!",
							category: "snacks",
						},
						amount: 2,
						unitPrice: 900,
						subTotalPrice: 1800,
						tax: 180,
						currency: "JPY",
					},
					{
						item: {
							rawName: "サントリー天然水 2L",
							normalized: "サントリー天然水",
							category: "drink",
						},
						amount: 1,
						unitPrice: 180,
						subTotalPrice: 180,
						tax: 18,
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
