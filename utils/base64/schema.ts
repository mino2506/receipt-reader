import { z } from "zod";
import { base64ImagePrefixRegex, base64ImageRegex, convertToBase64 } from ".";

export const Base64ImageSchema = z
	.string()
	.regex(base64ImageRegex, {
		message: "base64 形式ではありません。",
	})
	.transform((value) => value.replace(base64ImagePrefixRegex, ""));
