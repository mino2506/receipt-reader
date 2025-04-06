// utils/googleCloudVision.ts

import vision from "@google-cloud/vision";

export const googleCloudVisionClient = new vision.ImageAnnotatorClient({
	keyFilename: process.env.GOOGLE_CLOUD_VISION_API_KEY ?? "",
});
