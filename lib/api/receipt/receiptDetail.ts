// lib/api/receipt/receiptDetail.ts

import { z } from "zod";
import { IsoDateSchema, UuidIdSchema } from "./common";
import { CurrencyEnum } from "./currency";
import { CreateItemSchema } from "./item";

/**
 * Zod Schema
 * - レシート詳細テーブルPOST用のスキーマ定義 ( 単一明細 )
 * - itemId から作成
 * @see CurrencyEnum - スキーマ定義
 */
export const CreateReceiptDetailSchema = z.object({
	itemId: z.string().uuid(),

	amount: z.number().int().min(1),
	unitPrice: z.number().int().min(0),
	subTotalPrice: z.number().int().min(0),
	tax: z.number().int().min(0),
	currency: CurrencyEnum,

	receiptId: z.string().uuid().optional(),
});

/**
 * Zod Schema
 * - レシート詳細テーブルPOST用のスキーマ定義 ( 単一明細 )
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

/**
 * Zod Schema
 * - レシート詳細テーブルPOST用のスキーマ定義 ( 複数明細 )
 * - 作成されたレシート詳細のすべてのデータを含む
 * @see CreateReceiptDetailSchema - 単体定義
 */
export const CreatedReceiptDetailSchema = CreateReceiptDetailSchema.extend({
	id: z.string().uuid(),
	createdAt: IsoDateSchema,
	updatedAt: IsoDateSchema,
	deletedAt: IsoDateSchema.nullable(),
});

/**
 * Zod Schema
 * - レシート詳細テーブルUPDATE用のスキーマ定義（部分更新対応）
 * @see CreateReceiptDetailSchema - 基本構造を継承
 */
export const UpdateReceiptDetailSchema =
	CreateReceiptDetailSchema.partial().extend(UuidIdSchema.shape);

/**
 * Zod Schema
 * - レシート詳細テーブルGET用のスキーマ定義
 */
export const ReceiptDetailIdSchema = UuidIdSchema;

// [バルク操作用]

/**
 * Zod Schema
 * - レシート詳細テーブル複数POST用のスキーマ定義 ( 複数明細 )
 * @see CreateReceiptDetailSchema - 単体定義
 */
export const CreateReceiptDetailArraySchema = z
	.array(CreateReceiptDetailSchema)
	.min(1);

/**
 * Zod Schema
 * - レシート詳細テーブルPOST用のスキーマ定義 ( 複数明細 )
 * @see CreateReceiptDetailWithItemSchema - 単体定義
 */
export const CreateReceiptDetailWithItemArraySchema = z
	.array(CreateReceiptDetailWithItemSchema)
	.min(1);

/**
 * Zod Schema
 * - レシート詳細テーブルPOST用のスキーマ定義 ( 複数明細 )
 * - 作成されたレシート詳細のすべてのデータを含む配列
 * @see CreatedReceiptDetailSchema - 単体定義
 */
export const CreatedReceiptDetailArraySchema = z
	.array(CreatedReceiptDetailSchema)
	.min(1);

/**
 * Zod Schema
 * - レシート詳細テーブルUPDATE用のスキーマ定義 ( 複数明細 )
 * @see UpdateReceiptDetailSchema - 単体定義
 */
export const UpdateReceiptDetailArraySchema = z
	.array(UpdateReceiptDetailSchema)
	.min(1);

/**
 * Zod Schema
 * - レシート詳細テーブルGET/DELETE用のスキーマ定義 ( 複数明細 )
 * @see ReceiptDetailIdSchema - 単体定義
 */
export const ReceiptDetailIdArraySchema = z.array(UuidIdSchema).min(1);
