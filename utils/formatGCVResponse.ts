import response from "@/gcvRawData.json";
import type { protos } from "@google-cloud/vision";

type GCVResponse = {
	message: string;
	result: protos.google.cloud.vision.v1.IAnnotateImageResponse;
};

export type WordInfo = {
	text: string;
	boundingBox: {
		vertices: { x: number; y: number }[];
	};
	confidence: number;
};

export type PageInfo = {
	pageIndex: number;
	size: {
		width: number;
		height: number;
	};
	words: WordInfo[];
};

/**
 * データが GCVResponse 型かどうかを判定する Type Guard 関数
 *
 * @param data - チェック対象の unknown 型データ
 * @returns boolean 型判定結果 GCVResponse 構造であれば true を返す
 */
export function isGCVResponse(data: unknown): data is GCVResponse {
	if (
		typeof data === "object" &&
		data !== null &&
		"message" in data &&
		typeof data.message === "string" &&
		"result" in data &&
		typeof data.result === "object" &&
		data.result !== null &&
		"fullTextAnnotation" in data.result
	) {
		return true;
	}
	return false;
}

/**
 * unknown 型データを安全に GCVResponse に変換する
 *
 * @param data - 任意のデータ（JSONやfetch結果など）
 * @returns GCVResponse 型のデータ 適合しない場合は null を返す
 *
 * @example
 * const parsed = parseGCVResponse(json);
 * if (parsed) {
 *   console.log(parsed.result.fullTextAnnotation?.text);
 * }
 */
export function parseGCVResponse(data: unknown): GCVResponse | null {
	if (isGCVResponse(data)) {
		return data;
	}
	return null;
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
export function extractPagesFromGCV(response: GCVResponse): PageInfo[] {
	const result: PageInfo[] = [];

	const pages = response.result.fullTextAnnotation?.pages ?? [];

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
 * @param lineMergeRatio - 高さに対する行マージの許容割合（例: 0.01 = 1%）
 * @param confidenceThreshold - 最低信頼度 この値未満の単語は除外される
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

// const errorResponse = { message: "Invalid image", result: null };
// const parsedErrorGCVResponse = parseGCVResponse(errorResponse) as GCVResponse;
// const errorPages = extractPagesFromGCV(parsedErrorGCVResponse);
// console.log(errorPages);
const parsedGCVResponse = parseGCVResponse(response) as GCVResponse;
const pages = extractPagesFromGCV(parsedGCVResponse);
for (const page of pages) {
	console.log(page.size);
	const words = page.words;
	const lines: string[] = groupWordsIntoLinesByRatio(words, page.size.height);

	console.log(lines);
	console.log(JSON.stringify(lines).length);
}
