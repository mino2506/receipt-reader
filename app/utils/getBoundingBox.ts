import sampleReceiptMultiLine from "@/sampleReceiptMultiLine.json";
import type { google } from "@google-cloud/vision/build/protos/protos";

const receiptRawResponse: google.cloud.vision.v1.IAnnotateImageResponse =
	sampleReceiptMultiLine as google.cloud.vision.v1.IAnnotateImageResponse;

const receiptFullTextAnnotation =
	receiptRawResponse.fullTextAnnotation as google.cloud.vision.v1.ITextAnnotation;

/**
 * 単語リストからテキスト行を生成し、最初の単語の座標を取得
 */
const extractTextLine = (words: google.cloud.vision.v1.IWord[]) => {
	const text = words
		.map((word) => word.symbols?.map((symbol) => symbol.text).join("") ?? "")
		.join(" ");

	const boundingBox = words[0]?.boundingBox ?? null; // 最初の単語の座標を使用
	return { text, boundingBox };
};

/**
 * 段落からテキスト行を抽出
 */
const extractParagraphs = (paragraphs: google.cloud.vision.v1.IParagraph[]) => {
	return paragraphs.map((paragraph) => extractTextLine(paragraph.words ?? []));
};

/**
 * ブロックからテキスト行を抽出
 */
const extractBlocks = (blocks: google.cloud.vision.v1.IBlock[]) => {
	return blocks.flatMap((block) => extractParagraphs(block.paragraphs ?? []));
};

/**
 * ページからテキスト行を抽出
 */
export const extractTextWithBoundingBox = (
	annotation: google.cloud.vision.v1.ITextAnnotation,
) => {
	return (
		annotation.pages?.flatMap((page) => extractBlocks(page.blocks ?? [])) ?? []
	);
};

if (!receiptFullTextAnnotation) {
	console.error("No text annotation found");
} else {
	const linesWithBoundingBoxes = extractTextWithBoundingBox(
		receiptFullTextAnnotation,
	);
	console.log(linesWithBoundingBoxes);
}

console.log(extractTextWithBoundingBox(receiptFullTextAnnotation));
