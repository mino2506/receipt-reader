import type { GcvRequest } from "@/lib/_flow/runGoogleCloudVision";
import { googleCloudVisionClient } from "@/lib/googleCloudVision/client";
import type { protos } from "@google-cloud/vision";
import { Context, Effect, Layer } from "effect";

export type GcvInfraError = {
	_tag: "GcvInitError";
	cause: unknown;
};

export type AnnotateImageResponse =
	protos.google.cloud.vision.v1.IAnnotateImageResponse;

export class GcvService extends Context.Tag("GcvService")<
	GcvService,
	{
		clientName: string;
		annotateImage: (req: GcvRequest) => Promise<[AnnotateImageResponse]>;
	}
>() {}

const toGcvInfraError = (e: unknown): GcvInfraError =>
	({ _tag: "GcvInitError", cause: e }) satisfies GcvInfraError;

const makeGcvService = Effect.try({
	try: () => ({
		clientName: "default",
		annotateImage: (req: GcvRequest) =>
			googleCloudVisionClient.annotateImage(req),
	}),
	catch: toGcvInfraError,
});

export const GcvServiceLayer = Layer.effect(GcvService, makeGcvService);
