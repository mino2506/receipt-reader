// lib/api/receipt/common.ts

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
