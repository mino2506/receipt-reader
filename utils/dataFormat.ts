import response from "@/gcvRawData.json";
import type { protos } from "@google-cloud/vision";

type GCVResponse = {
	message: string;
	result: protos.google.cloud.vision.v1.IAnnotateImageResponse;
};

/**
 * GCVResponse型かどうかを判定する型ガード関数
 * @param data - チェック対象のデータ
 * @returns - データがGCVResponse型であればtrue、そうでなければfalse
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
 * unknownデータを安全にパースして GCVResponse を返す
 *
 * @param data - JSONやFetch結果などの任意のデータ
 * @returns - GCVResponse型オブジェクト。適合しない場合はnull
 */
export function parseGCVResponse(data: unknown): GCVResponse | null {
	if (isGCVResponse(data)) {
		return data;
	}
	return null;
}

type WordInfo = {
	text: string;
	boundingBox: {
		vertices: { x: number; y: number }[];
	};
	confidence: number;
};

/**
 * GCVのレスポンスから単語情報を抽出する
 * @param data - GCVのレスポンスデータ
 * @returns - 単語情報の配列
 * @throws - データのパースに失敗した場合はエラーを投げる
 * @example
 * const words = extractWordsFromGCV(data);
 * console.log(words);
 */
export function extractWordsFromGCV(data: unknown): WordInfo[] {
	const extractedWords: WordInfo[] = [];

	const parsedData = parseGCVResponse(data);
	if (!parsedData) {
		console.error("Failed to parse data");
		return [];
	}

	const pages = parsedData.result.fullTextAnnotation?.pages ?? [];
	for (const page of pages) {
		const blocks = page.blocks ?? [];
		for (const block of blocks) {
			const paragraphs = block.paragraphs ?? [];
			for (const paragraph of paragraphs) {
				const words = paragraph.words ?? [];
				for (const word of words) {
					const symbols = word.symbols ?? [];
					const wordVertice = (word.boundingBox?.vertices ?? []).map((v) => ({
						x: v.x ?? 0,
						y: v.y ?? 0,
					}))[0];
					const text = symbols.map((s) => s.text).join("");
					const vertices = symbols.map((s) => ({
						x: s.boundingBox?.vertices?.[0]?.x ?? 0,
						y: s.boundingBox?.vertices?.[0]?.y ?? 0,
					}));
					const rawConfidence =
						symbols.reduce((acc, symbol) => acc + (symbol.confidence ?? 0), 0) /
						symbols.length;
					extractedWords.push({
						text,
						boundingBox: { vertices: [wordVertice ?? { x: 0, y: 0 }] },
						confidence: Number(rawConfidence.toFixed(2)),
					});
				}
			}
		}
	}

	return extractedWords;
}

type Line = {
	y: number; // 行のY座標代表値
	words: WordInfo[];
};

export function groupWordsIntoLines(
	words: WordInfo[],
	lineMergeThreshold = 10,
	confidenceThreshold = 0.8,
): string[] {
	const lines: Line[] = [];

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
		.map((line) => line.words.map((word) => word.text).join(" "));
}

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

const extractedWords = extractWordsFromGCV(response);
// console.log(extractedWords);
// for (const word of extractedWords) {
// 	console.log(word.text, word.boundingBox.vertices, word.confidence);
// }
// console.log(`raw json length: ${JSON.stringify(response.result).length}`);
// console.log(`simplified json length: ${JSON.stringify(extractedWords).length}`);
// console.log(
// 	extractWordsFromGCV(response).reduce((acc, word) => acc + word.text, ""),
// );

console.log(response.result.fullTextAnnotation?.text);
const lines = groupWordsIntoLines(
	extractedWords,
	(response.result.fullTextAnnotation?.pages[0]?.height ?? 0) * 0.01,
	0,
);
console.log(lines);
console.log(JSON.stringify(lines).length);
