import { z } from "zod";
import { GCVFeatureType } from ".";
import { type GCVRequest, GCVRequestSchema } from "./schema";

export function isGCVRequest(data: unknown): boolean {
	return GCVRequestSchema.safeParse(data).success;
}

export function isGCVRequestType(data: unknown): data is GCVRequest {
	return GCVRequestSchema.safeParse(data).success;
}
