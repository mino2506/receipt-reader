// lib/api/receipt/receipt.ts

import { z } from "zod";
import { IsoDateSchema, UuidIdSchema } from "./common";

/**
 * Zod Schema
 * - レシートテーブルPOST用のスキーマ定義
 * - レシート作成用の最小限のデータ { totalPrice, userId } のみ
 */
export const CreateReceiptSchema = z.object({
	totalPrice: z.number().int().nonnegative(),
	userId: z.string().uuid(),
});
/**
 * Zod Schema
 * - レシートテーブルPOST用のスキーマ定義
 * - 作成されたレシートのすべてのデータを含む
 * @see CreateReceiptSchema - スキーマ定義
 */
export const CreatedReceiptSchema = CreateReceiptSchema.extend({
	id: z.string().uuid(),
	createdAt: IsoDateSchema,
	updatedAt: IsoDateSchema,
	deletedAt: IsoDateSchema.nullable(),
});

/**
 * Zod Schema
 * レシートテーブルPUT/PATCH用のスキーマ定義
 * @see CreateReceiptSchema - スキーマ定義
 */
export const UpdateReceiptSchema = CreateReceiptSchema.partial().extend(
	UuidIdSchema.shape,
);

// GET/DELETE: 主にIDのみ必要
/**
 * Zod Schema
 * レシートテーブルGET/DELETE用のスキーマ定義
 */
export const ReceiptIdSchema = UuidIdSchema;
