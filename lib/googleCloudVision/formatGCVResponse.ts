import normalReceipt from "@/gcvRawData.json";
import {
	type GCVSingleResponse,
	GCVSingleResponseSchema,
} from "@/lib/googleCloudVision/schema";
import angledReceipt from "@/sampleReceiptAngled.json";
import { ZodError } from "zod";

// [変換用]
type WordInfo = {
	text: string;
	boundingBox: {
		vertices: { x: number; y: number }[];
	};
	confidence: number;
};

type PageInfo = {
	pageIndex: number;
	size: {
		width: number;
		height: number;
	};
	words: WordInfo[];
};

// 行ごとに配列化するための型
type Line = {
	y: number;
	words: WordInfo[];
};

/**
 * unknown 型データを安全に GCVSingleResponse に変換する
 *
 * @param data - GCVの **単一** レスポンス相当のデータ（JSONやfetchのdata部分）
 * @returns GCVSingleResponse 型のデータ。Zodスキーマに適合しない場合はエラーをスロー
 *
 * @example
 * const parsed = parseGCVResponse(response.data);
 * console.log(parsed.fullTextAnnotation?.text);
 */
export function parseGCVResponse(data: unknown): GCVSingleResponse {
	const parsed = GCVSingleResponseSchema.safeParse(data);
	if (!parsed.success) {
		console.error("🛑 GCV response schema mismatch:", parsed.error.format());
		throw new ZodError(parsed.error.issues);
	}
	if (!parsed.data.fullTextAnnotation) {
		throw new Error("GCV data is missing fullTextAnnotation");
	}
	return parsed.data;
}

/**
 * GCVResponse からページ単位の構造化データを抽出する
 *
 * @param response - Google Cloud Vision のレスポンス（パース済み）
 * @returns PageInfo 配列 各ページのインデックス・サイズ・WordInfo のリストを含む
 *
 * @example
 * const parsed = parseGCVResponse(data);
 * if (parsed) {
 *   const pages = extractPagesFromGCV(parsed);
 *   console.log(pages[0].words);
 * }
 */
export function extractPagesFromGCV(response: GCVSingleResponse): PageInfo[] {
	const result: PageInfo[] = [];

	console.log("response", response);
	const pages = response.fullTextAnnotation?.pages ?? [];
	console.log("pages", pages);

	for (const [pageIndex, page] of pages.entries()) {
		const width = page.width ?? 500;
		const height = page.height ?? 1500;

		const words: WordInfo[] = [];

		for (const block of page.blocks ?? []) {
			for (const paragraph of block.paragraphs ?? []) {
				for (const word of paragraph.words ?? []) {
					const symbols = word.symbols ?? [];
					const text = symbols.map((s) => s.text).join("");
					const confidence =
						symbols.reduce((acc, s) => acc + (s.confidence ?? 0), 0) /
						symbols.length;
					// const x2 = word.boundingBox?.vertices?.[0]?.x ?? 0;
					// const y2 = word.boundingBox?.vertices?.[0]?.y ?? 0;
					let x: number | undefined;
					let y: number | undefined;
					let vertices: { x: number; y: number }[] | undefined;
					if (
						typeof word.boundingBox?.vertices?.length !== "undefined" &&
						word.boundingBox?.vertices?.length > 3
					) {
						const v = word.boundingBox.vertices;
						if (
							v[0] &&
							v[1] &&
							v[2] &&
							v[3] &&
							v[0].x &&
							v[1].x &&
							v[2].x &&
							v[3].x &&
							v[0].y &&
							v[1].y &&
							v[2].y &&
							v[3].y
						) {
							vertices = [
								{ x: v[0].x, y: v[0].y },
								{ x: v[1].x, y: v[1].y },
								{ x: v[2].x, y: v[2].y },
								{ x: v[3].x, y: v[3].y },
							];
						}
					}

					if (!text || confidence === undefined) continue;

					words.push({
						text,
						confidence: Number(confidence.toFixed(2)),
						boundingBox: { vertices: vertices ?? [{ x: 0, y: 0 }] },
					});
				}
			}
		}

		result.push({
			pageIndex,
			size: { width, height },
			words,
		});
	}

	return result;
}

import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";
import sumBy from "lodash/sumBy";
import { atan2 } from "mathjs";

/**
 * WordInfo 配列から行ごとに単語をグループ化
 * - 各単語の頂点から dx/dy から傾きを算出して補正
 *
 * @param words - WordInfo[] 全単語（単ページ）
 * @param imageHeight - ページ画像の高さ ( px ). 行マージの基準に使用
 * @param lineMergeRatio - Optional (Default: 0.01) 高さに対する行マージの許容割合（例: 0.01 = 1%）
 * @param confidenceThreshold - 最低信頼度。この値未満の単語は除外（既定: 0.8）
 * @returns 行ごとに文字列化された配列（Y座標の昇順）
 */
export function groupWordsWithDeskew(
	words: WordInfo[],
	imageHeight: number,
	lineMergeRatio = 0.02,
	confidenceThreshold = 0.8,
): string[] {
	const yThreshold = imageHeight * lineMergeRatio;

	// 1. 信頼度フィルタ済みの単語（ノイズ除去）
	const filtered = words.filter((w) => w.confidence >= confidenceThreshold);

	// 2. 各単語の左上・右上の dx/dy から傾きを算出
	const angles = filtered.flatMap((w) => {
		const v = w.boundingBox.vertices;
		if (v?.[0] && v?.[1] && v?.[2] && v?.[3]) {
			const dx = v[1].x - v[0].x + v[2].x - v[3].x;
			const dy = v[1].y - v[0].y + v[2].y - v[3].y;
			console.log("dx, dy", dx, dy);
			const rad = atan2(dy, dx);
			return [rad];
		}
		return [];
	});
	console.log("angles", angles);

	const averageRad =
		angles.length > 0 ? sumBy(angles, (r) => r) / angles.length : 0;

	const slope = Math.tan(averageRad);

	// 3. 各単語のY座標を deskew（水平補正）して新フィールド rotatedY を追加
	const rotatedWords = filtered.map((w) => {
		const vertex = w.boundingBox.vertices[0];
		const { x = 0, y = 0 } = vertex ?? {};
		const rotatedY = y - slope * x;
		return { ...w, rotatedY };
	});

	// 4. Y座標でグループ化
	const grouped = groupBy(rotatedWords, (w) =>
		Math.round(w.rotatedY / yThreshold),
	);

	// 5. 各行をX昇順で並べて、文字列に変換
	const lineEntries = Object.entries(grouped).map(([key, group]) => ({
		key,
		words: sortBy(group, (w) => w.boundingBox.vertices[0]?.x ?? 0),
		sortY: group[0]?.rotatedY ?? 0,
		line: group.map((w) => w.text).join(" "),
	}));

	// 6. 行順にソートして返す
	const retrunGroup = lineEntries
		.sort((a, b) => a.sortY - b.sortY)
		.map((l) => l.line);

	// 7. ログ出力
	const log = {
		deskew: {
			applied: true,
			yThreshold,
			confidenceThreshold,
			estimatedSlope: slope,
			angleDeg: -(averageRad * 180) / Math.PI,
			method: "dx/dy from vertices[0]→[1]",
			lineCount: retrunGroup.length,
		},
	};
	console.log("[groupWordsWithDeskew] log:", log);

	return retrunGroup;
}

/**
 * @deprecated
 *
 * 単語リストをY座標の近さに基づいて行ごとにグループ化する
 *
 * @param words - WordInfo[] ページ内の単語リスト
 * @param imageHeight - ページ画像の高さ ( px ). 行マージの基準に使用
 * @param lineMergeRatio - Optional (Default: 0.01) 高さに対する行マージの許容割合（例: 0.01 = 1%）
 * @param confidenceThreshold - Optional (Default: 0.8) 最低信頼度 この値未満の単語は除外される
 * @returns 行ごとに結合された文字列の配列（上から順）
 *
 * @example
 * const lines = groupWordsIntoLinesByRatio(page.words, page.size.height);
 * console.log(lines.join("\n"));
 */
export function groupWordsIntoLinesByRatio(
	words: WordInfo[],
	imageHeight: number,
	lineMergeRatio = 0.01,
	confidenceThreshold = 0.5,
): string[] {
	const lines: Line[] = [];
	const lineMergeThreshold = imageHeight * lineMergeRatio;

	for (const word of words) {
		if (word.confidence < confidenceThreshold) continue;

		const y = word.boundingBox.vertices[0]?.y ?? 0;

		const existingLine = lines.find(
			(line) => Math.abs(line.y - y) < lineMergeThreshold,
		);

		if (existingLine) {
			existingLine.words.push(word);
		} else {
			lines.push({ y, words: [word] });
		}
	}

	for (const line of lines) {
		line.words.sort(
			(a, b) =>
				(a.boundingBox.vertices[0]?.x ?? 0) -
				(b.boundingBox.vertices[0]?.x ?? 0),
		);
	}

	return lines
		.sort((a, b) => a.y - b.y)
		.map((line) => line.words.map((w) => w.text).join(" "));
}

// TODO: テストコード書くときに使う
// const errorResponse = { message: "Invalid image", result: null };
// const parsedErrorGCVResponse = parseGCVResponse(errorResponse) as GCVResponse;
// const errorPages = extractPagesFromGCV(parsedErrorGCVResponse);
// console.log(errorPages);
// import { inspect } from "node:util";
// console.log(inspect(response, { depth: null, colors: true }));

// const parsedGCVResponse = parseGCVResponse(normalReceipt.data);
// // console.log(parsedGCVResponse);
// const normalPages = extractPagesFromGCV(parsedGCVResponse);

// console.log("🌟真っすぐなレシート\n");

// console.log("回転補正❌なし");
// for (const page of normalPages) {
// 	console.log(page.size);
// 	const words = page.words;
// 	const lines: string[] = groupWordsIntoLinesByRatio(words, page.size.height);

// 	// console.log(lines);
// 	// console.log(JSON.stringify(lines.join("\n")));

// 	console.log(JSON.stringify(lines).length);
// 	console.log(lines.join("\n"));
// }

// console.log("回転補正✅あり！");
// for (const page of normalPages) {
// 	console.log(page.size);
// 	const words = page.words;
// 	const lines: string[] = groupWordsWithDeskew(words, page.size.height);

// 	// console.log(lines);
// 	// console.log(JSON.stringify(lines.join("\n")));

// 	console.log(JSON.stringify(lines).length);
// 	console.log(lines.join("\n"));
// }

// const parsedGCVResponseAngled = parseGCVResponse(angledReceipt.data);
// // console.log(parsedGCVResponse);
// const angledPages = extractPagesFromGCV(parsedGCVResponseAngled);

// console.log("🌟傾いたレシート\n");

// console.log("回転補正❌なし");
// for (const page of angledPages) {
// 	console.log(page.size);
// 	const words = page.words;
// 	const lines: string[] = groupWordsIntoLinesByRatio(words, page.size.height);

// 	// console.log(lines);
// 	// console.log(JSON.stringify(lines.join("\n")));

// 	console.log(JSON.stringify(lines).length);
// 	console.log(lines.join("\n"));
// }

// console.log("回転補正✅あり！");
// for (const page of angledPages) {
// 	console.log(page.size);
// 	const words = page.words;
// 	const lines: string[] = groupWordsWithDeskew(words, page.size.height);

// 	// console.log(lines);
// 	// console.log(JSON.stringify(lines.join("\n")));

// 	console.log(JSON.stringify(lines).length);
// 	console.log(lines.join("\n"));
// }
