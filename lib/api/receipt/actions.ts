"use server";

import { prisma } from "@/lib/prisma";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

import {
	type ApiResponseFromType,
	createApiResponseSchema,
} from "@/lib/api/common.schema";
import { CreateReceiptSchema } from "@/lib/api/receipt/receipt";
import { CreateReceiptDetailArraySchema } from "@/lib/api/receipt/receiptDetail";

const CreateReceiptWithDetailsSchema = z.object({
	receipt: CreateReceiptSchema,
	details: CreateReceiptDetailArraySchema,
});
type CreateReceiptWithDetailsInput = z.infer<
	typeof CreateReceiptWithDetailsSchema
>;

const ApiResponseReceiptWithDetailsSchema = createApiResponseSchema(
	CreateReceiptWithDetailsSchema,
);
type ApiResponseReceiptWithDetails =
	ApiResponseFromType<CreateReceiptWithDetailsInput>;

export async function createReceiptWithDetails(
	input: CreateReceiptWithDetailsInput,
): Promise<ApiResponseReceiptWithDetails> {
	// ✅ Zodで安全性確認
	const parsed = CreateReceiptWithDetailsSchema.safeParse(input);
	if (!parsed.success) {
		console.log("❌ エラーの元データ:", input);
		console.error(
			"❌ リクエストパラメータのバリデーションに失敗しました",
			parsed.error,
		);
		return {
			success: false,
			error: {
				code: "request_parse_failed",
				message: parsed.error.message,
				field: "request",
			},
		};
	}

	const { receipt, details } = parsed.data;

	// ✅ Supabase認証（必要に応じて）
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

	try {
		// ✅ レシートを作成（UUIDはPrismaで自動生成）
		const createdReceipt = await prisma.receipt.create({
			data: {
				totalPrice: receipt.totalPrice,
				userId: user.id,
			},
		});

		// ✅ 明細を一括作成
		await prisma.receiptDetail.createMany({
			data: details.map((d) => ({
				...d,
				receiptId: createdReceipt.id,
			})),
		});

		return { success: true, data: { receipt, details } };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error("❌ createReceiptWithDetails エラー:", error);
		return {
			success: false,
			error: {
				code: "create_receipt_failed",
				message: "createReceiptWithDetails の呼び出しに失敗しました",
				hint: message,
				field: "create",
			},
		};
	}
}
