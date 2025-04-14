// lib/api/receipt/item.ts

import { z } from "zod";
import { CategoryEnum } from "./category";

/**
 * Zod Schema
 * 商品テーブルPOST用のスキーマ定義
 * @see CategoryEnum - スキーマ定義
 */
export const CreateItemSchema = z.object({
	rawName: z.string().min(1),
	normalized: z.string().min(1).nullable().optional(),
	category: CategoryEnum,
});

/**
 * Zod Schema
 * 商品テーブルGET用のスキーマ定義
 * @see CreateItemSchema - スキーマ定義
 */
export const ItemSchema = CreateItemSchema.extend({
	id: z.string().uuid(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});
