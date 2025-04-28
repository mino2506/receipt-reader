import { prisma } from "@/lib/prisma";
import { createClient as createServerClient } from "@/lib/supabase/client.server";

import type { ApiResponseFromType } from "@/lib/api/common.schema";
import {
	type ReceiptWithItemDetails,
	ReceiptWithItemDetailsSchema,
} from "@/lib/api/receipt/get.schema";

type ApiResponseReceiptWithDetails =
	ApiResponseFromType<ReceiptWithItemDetails>;

/**
 * 指定したレシートIDに紐づく明細を全件取得する
 *
 * @param receiptId - ReceiptテーブルのID(UUID)
 * @returns ReceiptDetail[] 配列（receiptId に一致する全明細）
 */
export async function getReceiptDetailsById(
	receiptId: string,
): Promise<ApiResponseReceiptWithDetails> {
	try {
		const supabase = await createServerClient();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return {
				success: false,
				error: {
					code: "auth_user_fetch_failed",
					message: "認証ユーザー情報の取得に失敗しました",
					field: "auth",
				},
			};
		}

		const fetched = await prisma.receipt.findUnique({
			where: { id: receiptId, userId: user.id, deletedAt: null },
			include: {
				store: true,
				receiptDetails: {
					where: { deletedAt: null },
					orderBy: {
						order: "asc",
					},
					include: {
						item: true,
					},
				},
			},
		});

		const parsed = ReceiptWithItemDetailsSchema.safeParse(fetched);

		if (!parsed.success) {
			return {
				success: false,
				error: {
					code: "invalid_receipt",
					message: "レシートが不正です",
					field: "parse",
				},
			};
		}

		return {
			success: true,
			data: parsed.data,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error("❌ getReceiptDetailsById エラー:", error);
		return {
			success: false,
			error: {
				code: "receipt_fetch_failed",
				message: "レシートの取得に失敗しました",
				field: "receipt",
			},
		};
	}
}
