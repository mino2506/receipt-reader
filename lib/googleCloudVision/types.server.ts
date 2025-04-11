"use server";

import type { protos } from "@google-cloud/vision";
import { z } from "zod";

export type GCVIAnnotateImageResponse =
	protos.google.cloud.vision.v1.IAnnotateImageResponse;

export type GCVResponse = {
	message: string;
	result: GCVIAnnotateImageResponse;
};

export type GCVCustomResult =
	| { success: true; result: GCVResponse }
	| { success: false; error: string };
