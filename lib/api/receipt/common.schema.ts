import { z } from "zod";

export const UuidIdSchema = z.object({ id: z.string().uuid() });

/**
 * Zod Schema
 * - Date を ISO 形式の文字列に変換するスキーマ
 * - すでに ISO 形式の文字列の場合はそのまま返す
 */
export const IsoDateSchema = z
	.union([z.string().datetime(), z.date()])
	.transform((v) => (v instanceof Date ? v.toISOString() : v));

/**
 * Zod Schema
 * 商品テーブル用のカテゴリーのスキーマ定義
 */
export const CategoryEnum = z.enum([
	"food",
	"drink",
	"snacks",
	"daily",
	"medical",
	"beauty_products",
	"clothing",
	"eating_out",
	"pet",
	"leisure",
	"transport",
	"utility",
	"other",
]);

/**
 * Zod Schema
 * レシート詳細テーブル用ののスキーマ定義
 */
export const CurrencyEnum = z.enum([
	"JPY",
	"USD",
	"EUR",
	"CNY",
	"KRW",
	"GBP",
	"AUD",
	"CAD",
	"other",
]);
