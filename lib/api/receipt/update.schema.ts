import {
	CategoryEnum,
	CurrencyEnum,
	IsoDateSchema,
} from "@/lib/api/receipt/common.schema";
import { z } from "zod";

/**
 * Zod Schema
 * - 基本的に使うな
 * - 名前がめちゃくちゃにならないように！
 */
export const UpdateItemSchema = z.object({
	id: z.string().uuid(),
	rawName: z.string().min(1),
	normalized: z.string().min(1).nullable().optional(),
	category: CategoryEnum,
});
export type UpdateItemInput = z.infer<typeof UpdateItemSchema>;

/**
 * Zod Schema
 * - 基本的に使うな
 * - 名前がめちゃくちゃにならないように！
 */
export const UpdateStoreSchema = z.object({
	id: z.string().uuid(),
	rawName: z.string().min(1),
	normalized: z.string().min(1).nullable().optional(),
});
export type UpdateStoreInput = z.infer<typeof UpdateStoreSchema>;

/**
 * Zod Schema
 * - item は、表記ゆれを防ぐため id で指定する
 */
export const UpdateReceiptSchema = z.object({
	id: z.string().uuid(),
	date: IsoDateSchema.optional(),
	totalPrice: z.number().int().nonnegative(),
	storeId: z.string().uuid().nullable(),
});
export type UpdateReceiptInput = z.infer<typeof UpdateReceiptSchema>;

/**
 * Zod Schema
 * - item は、表記ゆれを防ぐため id で指定する
 */
export const UpdateReceiptDetailSchema = z.object({
	id: z.string().uuid(),
	amount: z.number().int().min(1),
	unitPrice: z.number().min(0),
	subTotalPrice: z.number().min(0),
	tax: z.number().min(0),
	discount: z.number().nullable(),
	currency: CurrencyEnum,
	taxRate: z.number().int(),
	taxRateSource: z.enum(["explicit", "inferred"]),
	itemId: z.string().uuid(),
});
export type UpdateReceiptDetailInput = z.infer<
	typeof UpdateReceiptDetailSchema
>;
