import { Base64ImageSchema } from "@/utils/base64";
import { enumKeys } from "@/utils/generics/enumKeys";
import { z } from "zod";

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
