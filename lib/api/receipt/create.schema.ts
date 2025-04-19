import { z } from "zod";

import { e } from "mathjs";
import { CategoryEnum, CurrencyEnum, IsoDateSchema } from "./common.schema";

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
export type CreateItem = z.infer<typeof CreateItemSchema>;

/**
 * Zod Schema
 * - 店舗データのPOST用スキーマ定義
 */
export const CreateStoreSchema = z.object({
	rawName: z.string().min(1),
	normalized: z.string().min(1).nullable().optional(),
});
export type CreateStore = z.infer<typeof CreateStoreSchema>;

/**
 * Zod Schema
 * - レシートのPOST用のスキーマ定義
 * - レシート作成用の最小限のデータ { totalPrice, userId } のみ
 */
export const CreateReceiptSchema = z.object({
	totalPrice: z.number().int().nonnegative(),
	date: IsoDateSchema.optional(),
	store: CreateStoreSchema.optional(),
});
export type CreateReceipt = z.infer<typeof CreateReceiptSchema>;

/**
 * Zod Schema
 * - レシート詳細のPOST用のスキーマ定義 ( 単一明細 )
 * - item { rawName, normalized?, category } から作成
 * @see CreateItemSchema - スキーマ定義
 * @see CurrencyEnum - スキーマ定義
 */
export const CreateReceiptDetailSchema = z.object({
	itemId: z.string().uuid(),
	receiptId: z.string().uuid(),
	amount: z.number().int().min(1),
	unitPrice: z.number().int().min(0),
	subTotalPrice: z.number().int().min(0),
	tax: z.number().int().min(0),
	currency: CurrencyEnum,
});
export type CreateReceiptDetail = z.infer<typeof CreateReceiptDetailSchema>;

/**
 * Zod Schema
 * - レシート詳細のPOST用のスキーマ定義 ( 複数明細 )
 * @see CreateReceiptDetailWithItemSchema - 単体定義
 */
export const CreateReceiptDetailArraySchema = z
	.array(CreateReceiptDetailSchema)
	.min(1);
export type CreateReceiptDetailArray = z.infer<
	typeof CreateReceiptDetailArraySchema
>;

/**
 * Zod Schema
 * - レシート詳細のPOST用のスキーマ定義 ( 単一明細 )
 * - item { rawName, normalized?, category } から作成
 * @see CreateItemSchema - スキーマ定義
 * @see CurrencyEnum - スキーマ定義
 */
export const CreateReceiptDetailWithItemSchema = z.object({
	item: CreateItemSchema,
	amount: z.number().int().min(1),
	unitPrice: z.number().int().min(0),
	subTotalPrice: z.number().int().min(0),
	tax: z.number().int().min(0),
	currency: CurrencyEnum,
});
export type CreateReceiptDetailWithItem = z.infer<
	typeof CreateReceiptDetailWithItemSchema
>;

/**
 * Zod Schema
 * - レシート詳細のPOST用のスキーマ定義 ( 複数明細 )
 * @see CreateReceiptDetailWithItemSchema - 単体定義
 */
export const CreateReceiptDetailWithItemArraySchema = z
	.array(CreateReceiptDetailWithItemSchema)
	.min(1);
export type CreateReceiptDetailWithItemArray = z.infer<
	typeof CreateReceiptDetailWithItemArraySchema
>;

/**
 * Zod Schema
 * - レシート詳細のPOST用のスキーマ定義 ( 複数明細 )
 * - 作成されたレシート詳細のすべてのデータを含む配列
 * @see CreateReceiptSchema - レシート スキーマ定義
 * @see CreateReceiptDetailWithItemArraySchema - レシート詳細の配列 スキーマ定義
 */
export const CreateReceiptWithItemDetailsSchema = CreateReceiptSchema.extend({
	details: CreateReceiptDetailWithItemArraySchema,
});

/**
 * Zod Schema
 * - レシート全体のPOST用の型定義 ( 複数明細 )
 * @see CreateReceiptWithItemDetailsSchema - スキーマ定義
 */
export type CreateReceiptWithItemDetails = z.infer<
	typeof CreateReceiptWithItemDetailsSchema
>;
