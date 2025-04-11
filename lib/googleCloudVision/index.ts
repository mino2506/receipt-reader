export { googleCloudVisionClient } from "./client";
export { DEFAULT_GCV_FEATURES, API_ENDPOINTS } from "./constants";
export {
	GCVFeatureType,
	GCVFeatureSchema,
	ImageInputSchema,
	ToImageInputSchema,
	GCVRequestSchema,
	VertexSchema,
	type GCVVertex,
	BoundingBoxSchema,
	type GCVBoundingBox,
	SymbolSchema,
	type GCVSymbol,
	WordSchema,
	type GCVWord,
	ParagraphSchema,
	type GCVParagraph,
	BlockSchema,
	type GCVBlock,
	PageSchema,
	type GCVPage,
	FullTextAnnotationSchema,
	type GCVFullTextAnnotation,
	GCVSingleResponseSchema,
	type GCVSingleResponse,
	type GCVRequest,
	type GCVBase64RequestBody,
	type GCVUrlRequestBody,
	type GCVRequestBody,
	type WordInfo,
	type PageInfo,
} from "./schema";
export {
	isGCVResponseType,
	parseGCVResponse,
	extractPagesFromGCV,
	groupWordsIntoLinesByRatio,
} from "./formatGCVResponse";
export {
	validateImageInput,
	createGCVRequest,
	fetchGCVResult,
	tryParseAndFetchGCV,
} from "./handler";
export type {
	GCVIAnnotateImageResponse,
	GCVResponse,
	GCVCustomResult,
} from "./types.server";
