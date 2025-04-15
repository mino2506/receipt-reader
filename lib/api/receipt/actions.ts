"use server";

import { prisma } from "@/lib/prisma";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

import {
	type ApiResponseFromType,
	createApiResponseSchema,
} from "@/lib/api/common.schema";
import {
	type CreateReceiptDetailSchema,
	CreateReceiptDetailWithItemArraySchema,
	CreateReceiptSchema,
	CreatedReceiptDetailArraySchema,
	CreatedReceiptSchema,
} from "@/lib/api/receipt";

// [Input]
const CreateReceiptWithItemDetailsSchema = z.object({
	receipt: CreateReceiptSchema,
	details: CreateReceiptDetailWithItemArraySchema,
});
type CreateReceiptWithDetailsInput = z.infer<
	typeof CreateReceiptWithItemDetailsSchema
>;

// [Output]
const CreatedReceiptWithDetailsSchema = z.object({
	receipt: CreatedReceiptSchema,
	details: CreatedReceiptDetailArraySchema,
});
type CreatedReceiptWithDetails = z.infer<
	typeof CreatedReceiptWithDetailsSchema
>;

type ApiResponseReceiptWithDetails =
	ApiResponseFromType<CreatedReceiptWithDetails>;

type ReceiptDetailInput = z.infer<typeof CreateReceiptDetailSchema>;

export async function createReceiptWithDetails(
	input: CreateReceiptWithDetailsInput,
): Promise<ApiResponseReceiptWithDetails> {
	// ✅ Zodで安全性確認
	const parsed = CreateReceiptWithItemDetailsSchema.safeParse(input);
	if (!parsed.success) {
		console.log("❌ エラーの元データ:", input);
		console.error(
			"❌ リクエストパラメータのバリデーションに失敗しました",
			parsed.error.issues,
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

		// ✅ 一括作成したい明細の配列を空で作成
		const detailsToCreate: ReceiptDetailInput[] = [];

		for (const detail of details) {
			// ✅ 商品が登録済みか検索
			const existingItems = await prisma.item.findFirst({
				where: {
					...(detail.item.normalized
						? { normalized: detail.item.normalized }
						: { rawName: detail.item.rawName }),
				},
			});

			// ✅ 商品がなければ作成
			const item =
				existingItems ??
				(await prisma.item.create({
					data: {
						rawName: detail.item.rawName,
						normalized: detail.item.normalized ?? null,
						category: detail.item.category,
					},
				}));

			// ✅ 明細を detailsToCreate に追加
			detailsToCreate.push({
				amount: detail.amount,
				unitPrice: detail.unitPrice,
				subTotalPrice: detail.subTotalPrice,
				tax: detail.tax,
				currency: detail.currency,
				itemId: item.id,
				receiptId: createdReceipt.id,
			});
		}

		// ✅ 明細を一括作成
		// 要検証 .createMany() は id createdAt などを返さない
		// const createdDetails = await prisma.receiptDetail.createMany({
		// 	data: detailsToCreate.map((d) => ({
		// 		...d,
		// 		receiptId: createdReceipt.id,
		// 	})),
		// });
		const createdDetails = await Promise.all(
			detailsToCreate.map((d) =>
				prisma.receiptDetail.create({
					data: { ...d, receiptId: createdReceipt.id },
				}),
			),
		);

		const transformedReceipt = CreatedReceiptSchema.safeParse(createdReceipt);
		if (!transformedReceipt.success) {
			console.error(
				"❌ createReceiptWithDetails エラー:",
				transformedReceipt.error.issues,
			);
			return {
				success: false,
				error: {
					code: "receipt_validation_failed",
					message: "レシートの形式が不正です",
					hint: transformedReceipt.error.message,
					field: "receipt",
				},
			};
		}

		const transformedDetails =
			CreatedReceiptDetailArraySchema.safeParse(createdDetails);
		if (!transformedDetails.success) {
			console.error(
				"❌ createReceiptWithDetails エラー:",
				transformedDetails.error.issues,
			);
			return {
				success: false,
				error: {
					code: "details_validation_failed",
					message: "明細の形式が不正です",
					hint: transformedDetails.error.message,
					field: "details",
				},
			};
		}

		return {
			success: true,
			data: {
				receipt: transformedReceipt.data,
				details: transformedDetails.data,
			},
		};
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
