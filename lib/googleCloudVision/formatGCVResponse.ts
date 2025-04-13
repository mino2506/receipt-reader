import response from "@/gcvRawData.json";
import {
	type GCVSingleResponse,
	GCVSingleResponseSchema,
	type PageInfo,
	type WordInfo,
} from "@/lib/googleCloudVision/schema";
import { ZodError } from "zod";

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
					const x = word.boundingBox?.vertices?.[0]?.x ?? 0;
					const y = word.boundingBox?.vertices?.[0]?.y ?? 0;

					if (!text || confidence === undefined) continue;

					words.push({
						text,
						confidence: Number(confidence.toFixed(2)),
						boundingBox: { vertices: [{ x, y }] },
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

// 行ごとに配列かするための型
type Line = {
	y: number;
	words: WordInfo[];
};

/**
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
	confidenceThreshold = 0.8,
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

import type { WordInfo } from "@/lib/googleCloudVision/schema";
import _ from "lodash";
import { atan2 } from "mathjs";

/**
 * WordInfo 配列から行ごとに単語をグループ化（傾き補正付き）
 *
 * @param words - WordInfo[] 全単語（単ページ）
 * @param confidenceThreshold - 最低信頼度。この値未満の単語は除外（既定: 0.8）
 * @returns 行ごとに文字列化された配列（Y座標の昇順）
 */
export function groupWordsWithDeskew(
	words: WordInfo[],
	confidenceThreshold = 0.8,
): string[] {
	// 1. 信頼度フィルタ済みの単語
	const filtered = words.filter((w) => w.confidence >= confidenceThreshold);

	// 2. 左上の (x, y) 座標を抽出
	const points = filtered.map((w) => w.boundingBox.vertices[0]);

	// 3. 回帰直線を使って傾き（角度）を算出
	const n = points.length;
	const sumX = _.sumBy(points, (p) => p.x);
	const sumY = _.sumBy(points, (p) => p.y);
	const meanX = sumX / n;
	const meanY = sumY / n;
	const numerator = _.sumBy(points, (p) => (p.x - meanX) * (p.y - meanY));
	const denominator = _.sumBy(points, (p) => Math.pow(p.x - meanX, 2)) || 1;
	const slope = numerator / denominator;
	const angleRad = atan2(slope, 1); // x軸と成す角度（ラジアン）

	// 4. 傾きに応じてY座標を deskew（水平化）
	const rotatedWords = filtered.map((w) => {
		const { x, y } = w.boundingBox.vertices[0];
		const rotatedY = y - slope * x; // 単純 deskew（回転行列は使わない）
		return { ...w, rotatedY };
	});

	// 5. Y座標でグループ化（1%範囲で近似）
	const yThreshold = 10; // 10px 以内を同じ行とみなす
	const grouped = _.groupBy(rotatedWords, (w) =>
		Math.round(w.rotatedY / yThreshold),
	);

	// 6. 行ごとにX昇順に並べて、文字列に変換
	const lines = Object.values(grouped)
		.map((line) => _.sortBy(line, (w) => w.boundingBox.vertices[0].x))
		.map((line) => line.map((w) => w.text).join(" "));

	// 7. 行順に昇順ソート
	return lines.sort((a, b) => {
		const ay = grouped[a]?.[0].rotatedY ?? 0;
		const by = grouped[b]?.[0].rotatedY ?? 0;
		return ay - by;
	});
}

// TODO: テストコード書くときに使う
// const errorResponse = { message: "Invalid image", result: null };
// const parsedErrorGCVResponse = parseGCVResponse(errorResponse) as GCVResponse;
// const errorPages = extractPagesFromGCV(parsedErrorGCVResponse);
// console.log(errorPages);
// import { inspect } from "node:util";
// console.log(inspect(response, { depth: null, colors: true }));
// const parsedGCVResponse = parseGCVResponse(response.data);
// // console.log(parsedGCVResponse);
// const pages = extractPagesFromGCV(parsedGCVResponse);
// console.log("pages", pages);
// for (const page of pages) {
// 	console.log(page.size);
// 	const words = page.words;
// 	const lines: string[] = groupWordsIntoLinesByRatio(words, page.size.height);

// 	console.log(lines);
// 	console.log(JSON.stringify(lines.join("\n")));

// 	console.log(JSON.stringify(lines).length);
// 	console.log(lines.join("\n"));
// }
