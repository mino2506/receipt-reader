import { z } from "zod";

export const UuidIdSchema = z.string().uuid();
export type UuidId = z.infer<typeof UuidIdSchema>;

/**
 * Zod Schema
 * - Date を ISO 形式の文字列に変換するスキーマ
 * - すでに ISO 形式の文字列の場合はそのまま返す
 */
export const IsoDateSchema = z
	.union([z.string().datetime(), z.date()])
	.transform((v) => (v instanceof Date ? v.toISOString() : v));

export type IsoDate = z.infer<typeof IsoDateSchema>;

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
export type Category = z.infer<typeof CategoryEnum>;
export const CATEGORY_LABELS: Record<Category, string> = {
	food: "食費",
	drink: "飲料費",
	snacks: "お菓子",
	daily: "日用品",
	medical: "医療費",
	beauty_products: "美容",
	clothing: "衣類",
	eating_out: "外食",
	pet: "ペット",
	leisure: "娯楽",
	transport: "交通費",
	utility: "光熱費",
	other: "その他",
};

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
export type Currency = z.infer<typeof CurrencyEnum>;
export const CURRENCY_LABELS: Record<Currency, string> = {
	JPY: "円",
	USD: "ドル",
	EUR: "ユーロ",
	CNY: "人民元",
	KRW: "ウォン",
	GBP: "ポンド",
	AUD: "豪ドル",
	CAD: "カナダドル",
	other: "その他",
};
