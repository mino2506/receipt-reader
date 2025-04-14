import { z } from "zod";
import {
	base64ImagePrefixRegex,
	base64ImageRegex,
	base64PrefixRegex,
	base64Regex,
	pureBase64Regex,
} from "./formatBase64";

export type Base64Brand = { __kind: ["base64"] };
export type PureBase64Brand = { __kind: ["base64", "pure"] };
export type Base64ImageBrand = { __kind: ["base64", "image"] };
export type PureBase64ImageBrand = { __kind: ["base64", "image", "pure"] };

/**
 * Base64 の **ブランド型** 定義
 */
export type Base64 = string & { __kind: ["base64"] };

/**
 * Base64 の **ブランド型** 定義
 * `base64` の prefix を除去したもの
 */
export type PureBase64 = Base64 & { __kind: [...Base64["__kind"], "pure"] };

/**
 * Base64 画像の **ブランド型** 定義
 */
export type Base64Image = Base64 & { __kind: [...Base64["__kind"], "image"] };

/**
 * Base64 画像の **ブランド型** 定義
 * `base64Image` の prefix を除去したもの
 */
export type PureBase64Image = Base64 & {
	__kind: [...Base64["__kind"], "pure", "image"];
};

/**
 * Zod Schema
 * - Base64 のバリデーションをし、 **ブランド型** を付ける
 */
export const Base64Schema = z
	.string()
	.regex(base64Regex)
	.transform((v) => v as Base64);

/**
 * Zod Schema
 * - PureBase64 のバリデーションをし、 **ブランド型** を付ける
 * - prefix なしの Base64 を作成する
 */
export const ToPureBase64Schema = z
	.string()
	.regex(base64Regex)
	.transform((v) => v.replace(base64PrefixRegex, ""))
	.transform((value) => value as PureBase64);

/**
 * Zod Schema
 * - Base64Image のバリデーションをし、 **ブランド型** を付ける
 */
export const Base64ImageSchema = z
	.string()
	.regex(base64ImageRegex, {
		message: "base64Image 形式ではありません。",
	})
	.transform((value) => value as Base64Image);

/**
 * Zod Schema
 * - PureBase64Image のバリデーションをし、 **ブランド型** を付ける
 * - prefix なしの Base64Image を作成する
 */
export const ToPureBase64ImageSchema = z
	.string()
	.regex(base64ImageRegex, {
		message: "pureBase64Image ( prefix なし ) 形式ではありません。",
	})
	.transform((value) => value.replace(base64ImagePrefixRegex, ""))
	.transform((value) => value as PureBase64Image);

/**
 * Url の **ブランド型** 定義
 */
export type Url = string & { __kind: ["url"] };

/**
 * Zod Schema
 * - Url のバリデーションをし、 **ブランド型** を付ける
 */
export const UrlSchema = z
	.string()
	.url()
	.transform((value) => value as Url);
