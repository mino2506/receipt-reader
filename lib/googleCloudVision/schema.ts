// lib/googleCloudVision/schema.ts

import {
	type Base64Image,
	Base64ImageSchema,
	ToPureBase64ImageSchema,
	type Url,
	UrlSchema,
} from "@/utils/base64";
import { enumKeys } from "@/utils/generics/enumKeys";
import { z } from "zod";

// [FeatureType]
export enum GCVFeatureType {
	TYPE_UNSPECIFIED = 0,
	FACE_DETECTION = 1,
	LANDMARK_DETECTION = 2,
	LOGO_DETECTION = 3,
	LABEL_DETECTION = 4,
	TEXT_DETECTION = 5,
	DOCUMENT_TEXT_DETECTION = 11,
	SAFE_SEARCH_DETECTION = 6,
	IMAGE_PROPERTIES = 7,
	CROP_HINTS = 9,
	WEB_DETECTION = 10,
	PRODUCT_SEARCH = 12,
	OBJECT_LOCALIZATION = 19,
}

export const GCVFeatureSchema = z.object({
	type: z
		.enum(enumKeys(GCVFeatureType))
		.transform((key) => GCVFeatureType[key]),
});

// [Request]
export const ImageInputSchema = z.union([Base64ImageSchema, UrlSchema]);

export const ToImageInputSchema = z.union([ToPureBase64ImageSchema, UrlSchema]);

export const GCVRequestSchema = z.object({
	request: z.object({
		image: z.object({
			content: Base64ImageSchema,
		}),
		features: z
			.array(GCVFeatureSchema)
			.min(1, { message: "At least one feature is required" }),
	}),
});

export type GCVRequest = z.infer<typeof GCVRequestSchema>;

export type GCVBase64RequestBody = {
	image: {
		content: Base64Image;
	};
	features: {
		type: GCVFeatureType;
	}[];
};

export type GCVUrlRequestBody = {
	image: {
		source: {
			imageUri: Url;
		};
	};
	features: {
		type: GCVFeatureType;
	}[];
};

export type GCVRequestBody = GCVBase64RequestBody | GCVUrlRequestBody;

// [Response]
// 頂点（座標）
export const VertexSchema = z.object({
	x: z.number().optional(),
	y: z.number().optional(),
});
export type GCVVertex = z.infer<typeof VertexSchema>;

// boundingBox
export const BoundingBoxSchema = z.object({
	vertices: z.array(VertexSchema).length(4), // 四角形を想定
});
export type GCVBoundingBox = z.infer<typeof BoundingBoxSchema>;

// symbol（1文字）
export const SymbolSchema = z.object({
	text: z.string(),
	confidence: z.number().optional(),
	boundingBox: BoundingBoxSchema.optional(),
});
export type GCVSymbol = z.infer<typeof SymbolSchema>;

// word（単語）
export const WordSchema = z.object({
	symbols: z.array(SymbolSchema),
	confidence: z.number().optional(),
	boundingBox: BoundingBoxSchema.optional(),
});
export type GCVWord = z.infer<typeof WordSchema>;

// paragraph
export const ParagraphSchema = z.object({
	words: z.array(WordSchema),
	boundingBox: BoundingBoxSchema.optional(),
});
export type GCVParagraph = z.infer<typeof ParagraphSchema>;

// block
export const BlockSchema = z.object({
	paragraphs: z.array(ParagraphSchema),
	boundingBox: BoundingBoxSchema.optional(),
});
export type GCVBlock = z.infer<typeof BlockSchema>;

// page
export const PageSchema = z.object({
	width: z.number(),
	height: z.number(),
	blocks: z.array(BlockSchema),
});
export type GCVPage = z.infer<typeof PageSchema>;

// fullTextAnnotation
export const FullTextAnnotationSchema = z.object({
	text: z.string(),
	pages: z.array(PageSchema),
});
export type GCVFullTextAnnotation = z.infer<typeof FullTextAnnotationSchema>;

// responses[i]
export const GCVSingleResponseSchema = z.object({
	fullTextAnnotation: FullTextAnnotationSchema.optional(),
});
export type GCVSingleResponse = z.infer<typeof GCVSingleResponseSchema>;

// 最終レスポンス（GCVResponse）
const GCVResponseSchema = z.object({
	responses: z.array(GCVSingleResponseSchema),
});
type GCVResponse = z.infer<typeof GCVResponseSchema>; // !TODO: 名前の衝突

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
