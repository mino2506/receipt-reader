// lib/googleCloudVision/schema.ts

import {
	type Base64Image,
	Base64ImageSchema,
	type PureBase64Image,
	ToPureBase64ImageSchema,
	type Url,
	UrlSchema,
	convertToBase64,
	isPureBase64ImageBrand,
	isUrl,
	isUrlType,
	toPureBase64Image,
} from "@/utils/base64";
import { enumKeys } from "@/utils/generics/enumKeys";
import type { protos } from "@google-cloud/vision";
import { z } from "zod";

// FeatureType
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

// Request
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

// Response
export type GCVResponse = {
	message: string;
	result: protos.google.cloud.vision.v1.IAnnotateImageResponse;
};

export type GCVCustomResult =
	| { success: true; result: GCVResponse }
	| { success: false; error: string };

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
