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
/**
 * この型は、公式の型定義でのランタイムエラーを
 * 避けるための独自の型定義です。
 */
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

// [Request]
/**
 * Zod Schema
 * Google Cloud Vision 用の ***内部API*** へのリクエスト用
 */
export const GCVRequestFeatureSchema = z.object({
	type: z
		.union([z.enum(enumKeys(GCVFeatureType)), z.nativeEnum(GCVFeatureType)])
		.transform((value) =>
			typeof value === "string" ? GCVFeatureType[value] : value,
		),
});

/**
 * Zod Schema
 * Google Cloud Vision 用の ***内部API*** へのリクエスト用
 */
export const GCVRequestImageInputSchema = z.union([
	Base64ImageSchema,
	UrlSchema,
]);

/**
 * Zod Schema
 * Google Cloud Vision 用の ***内部API*** へのリクエスト用
 */
export const toGCVRequestImageInputSchema = z.union([
	ToPureBase64ImageSchema,
	UrlSchema,
]);

/**
 * Zod Schema
 * Google Cloud Vision 用の ***内部API*** へのリクエスト用
 * @see GCVRequest - 型定義
 */
export const GCVRequestSchema = z.object({
	request: z.object({
		image: z.object({
			content: Base64ImageSchema,
		}),
		features: z
			.array(GCVRequestFeatureSchema)
			.min(1, { message: "At least one feature is required" }),
	}),
});

/**
 * Zod Schema から変換した型定義
 * Google Cloud Vision 用の ***内部API*** へのリクエスト用
 * @see GCVRequestSchema - Zod Schema
 */
export type GCVRequest = z.infer<typeof GCVRequestSchema>;

/**
 * 型定義
 * Google Cloud Vision 用の ***内部API*** への
 * Base64Image を使用するリクエスト用
 * @see Base64Image - ブランド型定義
 * @see GCVFeatureType - 型定義
 */
export type GCVBase64RequestBody = {
	image: {
		content: Base64Image;
	};
	features: {
		type: GCVFeatureType;
	}[];
};

/**
 * 型定義
 * Google Cloud Vision 用の ***内部API*** への
 * Url を使用するリクエスト用
 * @see Url - ブランド型定義
 * @see GCVFeatureType - 型定義
 */
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

/**
 * 型定義
 * Google Cloud Vision 用の ***内部API*** へのリクエスト用
 * Base64Image 及び Url を使用するリクエスト用
 */
export type GCVRequestBody = GCVBase64RequestBody | GCVUrlRequestBody;
