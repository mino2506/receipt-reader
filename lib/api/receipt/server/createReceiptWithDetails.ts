"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";

import type { ApiResponseFromType } from "@/lib/api/common.schema";
import {
	type CreateReceiptWithItemDetails,
	CreateReceiptWithItemDetailsSchema,
} from "@/lib/api/receipt/create.schema";
import {
	type ReceiptWithItemDetails,
	ReceiptWithItemDetailsSchema,
} from "@/lib/api/receipt/get.schema";
import {
	insertReceiptWithDetails,
	selectReceiptWithDetails,
} from "@/lib/api/receipt/prisma";

export type ApiResponseReceiptWithDetails =
	ApiResponseFromType<ReceiptWithItemDetails>;

export async function createReceiptWithDetails(
	input: CreateReceiptWithItemDetails,
): Promise<ApiResponseReceiptWithDetails> {
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

	try {
		const createdReceiptId = await insertReceiptWithDetails(
			parsed.data,
			user.id,
		);

		const fetchedReceipt = await selectReceiptWithDetails(
			createdReceiptId,
			user.id,
		);

		if (!fetchedReceipt) {
			return {
				success: false,
				error: {
					code: "receipt_not_found",
					message: "作成したレシートが見つかりませんでした",
					field: "receipt",
				},
			};
		}

		const transformedReceipt =
			ReceiptWithItemDetailsSchema.safeParse(fetchedReceipt);
		if (!transformedReceipt.success) {
			console.warn("❌ エラーの元データ:", fetchedReceipt);
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

		return {
			success: true,
			data: transformedReceipt.data,
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
