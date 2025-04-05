import type { google } from "@google-cloud/vision/build/protos/protos";

/**
 * 複数のシンボルの boundingBox から外枠（union bounding box）を算出する
 * @param symbols - シンボルの配列
 * @returns union boundingBox または算出できなかった場合は null
 */
export function computeUnionBoundingBox(
	symbols: google.cloud.vision.v1.ISymbol[],
): google.cloud.vision.v1.IBoundingPoly | null {
	let minX: number | undefined, minY: number | undefined;
	let maxX: number | undefined, maxY: number | undefined;

	symbols.forEach((symbol) => {
		const vertices = symbol.boundingBox?.vertices;
		if (!vertices) return;
		vertices.forEach((vertex) => {
			if (vertex.x !== undefined && vertex.y !== undefined) {
				if (minX === undefined || vertex.x < minX) minX = vertex.x;
				if (minY === undefined || vertex.y < minY) minY = vertex.y;
				if (maxX === undefined || vertex.x > maxX) maxX = vertex.x;
				if (maxY === undefined || vertex.y > maxY) maxY = vertex.y;
			}
		});
	});

	if (
		minX === undefined ||
		minY === undefined ||
		maxX === undefined ||
		maxY === undefined
	) {
		return null;
	}
	return {
		vertices: [
			{ x: minX, y: minY }, // top-left
			{ x: maxX, y: minY }, // top-right
			{ x: maxX, y: maxY }, // bottom-right
			{ x: minX, y: maxY }, // bottom-left
		],
	};
}

/**
 * ITextAnnotation から各段落のテキストと文字の外枠を抽出する
 * @param annotation - Vision API の ITextAnnotation オブジェクト
 * @returns 各段落のテキストと外枠の配列
 */
function extractTextAndBoundingBoxes(
	annotation: google.cloud.vision.v1.ITextAnnotation,
): {
	text: string;
	boundingBox: google.cloud.vision.v1.IBoundingPoly | null;
}[] {
	const results: {
		text: string;
		boundingBox: google.cloud.vision.v1.IBoundingPoly | null;
	}[] = [];

	// ページ → ブロック → 段落の順に処理
	annotation.pages?.forEach((page) => {
		page.blocks?.forEach((block) => {
			block.paragraphs?.forEach((paragraph) => {
				let paragraphText = "";
				const allSymbols: google.cloud.vision.v1.ISymbol[] = [];

				paragraph.words?.forEach((word, wordIndex) => {
					// 単語間はスペースを入れる（必要に応じて調整）
					if (wordIndex > 0) {
						paragraphText += " ";
					}
					word.symbols?.forEach((symbol) => {
						paragraphText += symbol.text;
						allSymbols.push(symbol);
					});
				});

				const boundingBox = computeUnionBoundingBox(allSymbols);
				results.push({ text: paragraphText, boundingBox });
			});
		});
	});

	return results;
}
