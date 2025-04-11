// app/components/imageUploader/action.ts

"use server";

import { tryParseAndFetchGCV } from "@/lib/googleCloudVision";

/**
 * クライアントから直接使えるGCVラッパー（画像検証＋OCR呼び出し）
 *
 * @param input - Base64またはURL文字列
 * @returns GCV処理結果（success + data または error）
 */
export async function tryParseAndFetchGCVFromClient(input: unknown) {
	return await tryParseAndFetchGCV(input);
}
