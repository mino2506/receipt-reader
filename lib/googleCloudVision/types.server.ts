"use server";

import type { protos } from "@google-cloud/vision";

/**
 * @deprecated
 * 公式の型定義を使用すると、
 * クライアントコンポーネントでランタイムエラーが発生するため、
 * 独自の型定義を使用します。
 *
 * @see GCVFeatureType
 */
export type GCVIAnnotateImageResponse =
	protos.google.cloud.vision.v1.IAnnotateImageResponse;

/**
 * @deprecated
 * 公式の型定義を使用すると、
 * クライアントコンポーネントでランタイムエラーが発生するため、
 * 独自の型定義を使用します。
 *
 * @see
 */
export type GCVResponse = {
	message: string;
	result: GCVIAnnotateImageResponse;
};

/**
 * @deprecated
 * 公式の型定義を使用すると、
 * クライアントコンポーネントでランタイムエラーが発生するため、
 * 独自の型定義を使用します。
 *
 * @see
 */
export type GCVCustomResult =
	| { success: true; result: GCVResponse }
	| { success: false; error: string };
