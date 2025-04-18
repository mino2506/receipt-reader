// lib/api/receipt/get.schema.ts

import { z } from "zod";

import { CategoryEnum, CurrencyEnum, IsoDateSchema } from "./common.schema";

/**
 * Zod Schema
 * 商品のGET用のスキーマ定義
 */
export const ItemSchema = z.object({
	id: z.string().uuid(),
	rawName: z.string(),
	normalized: z.string().nullable(),
	category: CategoryEnum,
	createdAt: IsoDateSchema,
	updatedAt: IsoDateSchema,
});
export type Item = z.infer<typeof ItemSchema>;

/**
 * Zod Schema
 * - レシートのGET用のスキーマ定義
 */
export const ReceiptSchema = z.object({
	id: z.string().uuid(),
	createdAt: IsoDateSchema,
	updatedAt: IsoDateSchema,
	deletedAt: IsoDateSchema.nullable(),
	totalPrice: z.number().int().nonnegative(),
});
export type Receipt = z.infer<typeof ReceiptSchema>;

/**
 * Zod Schema
 * - レシート詳細のGET用のスキーマ定義
 * - 商品と紐づけて取得
 */
export const ReceiptDetailWithItemSchema = z.object({
	id: z.string().uuid(),
	createdAt: IsoDateSchema,
	updatedAt: IsoDateSchema,
	deletedAt: IsoDateSchema.nullable(),
	amount: z.number().int().min(1),
	unitPrice: z.number().int().min(0),
	subTotalPrice: z.number().int().min(0),
	tax: z.number().int().min(0),
	currency: CurrencyEnum,
	item: ItemSchema,
});
export type ReceiptDetailWithItem = z.infer<typeof ReceiptDetailWithItemSchema>;

/**
 * Zod Schema
 * - レシート詳細の配列のGET用のスキーマ定義
 */
export const ReceiptDetailWithItemArraySchema = z
	.array(ReceiptDetailWithItemSchema)
	.min(1);
export type ReceiptDetailWithItemArray = z.infer<
	typeof ReceiptDetailWithItemArraySchema
>;

/**
 * Zod Schema
 * - レシート全体のGET用のスキーマ定義
 */
export const ReceiptWithItemDetailsSchema = ReceiptSchema.extend({
	receiptDetails: ReceiptDetailWithItemArraySchema,
}).transform(({ receiptDetails, ...rest }) => ({
	...rest,
	details: receiptDetails,
}));
export type ReceiptWithItemDetails = z.infer<
	typeof ReceiptWithItemDetailsSchema
>;

export const ReceiptWithItemDetailsArraySchema = z.array(
	ReceiptWithItemDetailsSchema,
);
export type ReceiptWithItemDetailsArray = z.infer<
	typeof ReceiptWithItemDetailsArraySchema
>;
