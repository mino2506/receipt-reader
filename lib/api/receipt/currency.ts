// lib/api/receipt/currency.ts

import { z } from "zod";

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
