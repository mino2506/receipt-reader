// lib/api/receipt/category.ts

import { z } from "zod";

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
