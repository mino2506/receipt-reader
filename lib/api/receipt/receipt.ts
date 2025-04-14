// lib/api/receipt/receipt.ts

import { z } from "zod";
import { UuidIdSchema } from "./common";

/**
 * Zod Schema
 * レシートテーブルPOST用のスキーマ定義
 */
export const CreateReceiptSchema = z.object({
	totalPrice: z.number().int().nonnegative(),
	userId: z.string().uuid(),
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
