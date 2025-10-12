import vision from "@google-cloud/vision";

export const googleCloudVisionClient = new vision.ImageAnnotatorClient({
	projectId: process.env.GOOGLE_CLOUD_VISION_PROJECT_ID ?? "",
	client_email: process.env.GOOGLE_CLOUD_VISION_CLIENT_EMAIL ?? "",
	private_key: process.env.GOOGLE_CLOUD_VISION_API_KEY ?? "",
});
