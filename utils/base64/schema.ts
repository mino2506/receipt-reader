import { z } from "zod";
import {
	base64ImagePrefixRegex,
	base64ImageRegex,
	base64PrefixRegex,
	base64Regex,
	pureBase64Regex,
} from ".";

export type Base64 = string & { __kind: ["base64"] };
export type PureBase64 = Base64 & { __kind: [...Base64["__kind"], "pure"] };
export type Base64Image = Base64 & { __kind: [...Base64["__kind"], "image"] };
export type PureBase64Image = PureBase64 & PureBase64;

export const Base64Schema = z
	.string()
	.regex(base64Regex)
	.transform((v) => v as Base64);

export const ToPureBase64Schema = z
	.string()
	.regex(base64Regex)
	.transform((v) => v.replace(base64PrefixRegex, ""))
	.transform((value) => value as PureBase64);

export const Base64ImageSchema = z
	.string()
	.regex(base64ImageRegex, {
		message: "base64Image 形式ではありません。",
	})
	.transform((value) => value as Base64Image);

export const ToPureBase64ImageSchema = z
	.string()
	.regex(base64ImageRegex, {
		message: "pureBase64Image ( prefix なし ) 形式ではありません。",
	})
	.transform((value) => value.replace(base64ImagePrefixRegex, ""))
	.transform((value) => value as PureBase64Image);

export type Url = string & { __kind: ["url"] };

export const UrlSchema = z
	.string()
	.url()
	.transform((value) => value as Url);
