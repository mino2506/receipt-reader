import { GCVFeatureType } from ".";

export const DEFAULT_GCV_FEATURES = [
	{ type: GCVFeatureType.DOCUMENT_TEXT_DETECTION },
	{ type: GCVFeatureType.LABEL_DETECTION },
];

export const API_ENDPOINTS = {
	OCR: "/api/ocr",
};
