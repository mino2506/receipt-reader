"use client";

import type { CV } from "@/types/opencv";
import { useEffect, useRef } from "react";

interface CameraPreviewCanvasProps {
	cv: CV | null;
	videoRef: React.RefObject<HTMLVideoElement | null>;
	rotation?: number; // default 0
	isActive: boolean;
	className?: string;
	onError: (error: string) => void;
}

export function CameraPreviewCanvas({
	cv,
	videoRef,
	rotation: rotationInput = 0,
	isActive: isActiveInput,
	className = "",
	onError,
}: CameraPreviewCanvasProps) {
	const rotationRef = useRef(rotationInput);
	const isActiveRef = useRef(isActiveInput);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!cv || !videoRef.current || !canvasRef.current) return;

		// クロージャ内での凍結の回避用
		isActiveRef.current = isActiveInput;
		rotationRef.current = rotationInput;

		const isActive = isActiveRef.current;
		const rotation = rotationRef.current;
		const video = videoRef.current;
		const canvas = canvasRef.current;

		let animationId: number;

		// Main ループ: カメラ映像を描画する
		const render = () => {
			console.log("renderLoop");
			if (!isActive) return;
			if (video.readyState < 2) {
				animationId = requestAnimationFrame(render);
				return;
			}

			const width = video.videoWidth;
			const height = video.videoHeight;

			const cap = new cv.VideoCapture(video);
			const src = new cv.Mat(height, width, cv.CV_8UC4);
			const dst = new cv.Mat(
				rotation % 180 === 0 ? height : width,
				rotation % 180 === 0 ? width : height,
				cv.CV_8UC4,
			);

			cap.read(src);

			const deg = ((rotation % 360) + 360) % 360;
			switch (deg) {
				case 0:
					src.copyTo(dst);
					break;
				case 90:
					cv.rotate(src, dst, cv.ROTATE_90_CLOCKWISE);
					break;
				case 180:
					cv.rotate(src, dst, cv.ROTATE_180);
					break;
				case 270:
					cv.rotate(src, dst, cv.ROTATE_90_COUNTERCLOCKWISE);
					break;
				default:
					src.copyTo(dst);
					console.warn("Unsupported rotation:", render);
			}

			canvas.width = dst.cols;
			canvas.height = dst.rows;

			const normalized = preprocessForOcr(cv, dst);

			cv.imshow(canvas, normalized);

			normalized.delete;
			src.delete();
			dst.delete();

			animationId = requestAnimationFrame(render);
		};

		const handleMeta = () => {
			if (isActiveInput) {
				// video要素を元の映像サイズにリサイズ
				video.width = video.videoWidth;
				video.height = video.videoHeight;

				try {
					render();
				} catch (e) {
					const msg = e instanceof Error ? e.message : "不明のエラー";
					console.error(msg);
					onError(msg);
				}
			}
		};

		video.addEventListener("loadedmetadata", handleMeta);

		return () => {
			cancelAnimationFrame(animationId);
			video.removeEventListener("loadedmetadata", handleMeta);
		};
	}, [cv, isActiveInput, rotationInput, videoRef, onError]);

	return (
		<>
			<canvas
				ref={canvasRef}
				className={`w-full h-auto max-h-[75vh] object-contain border ${className}`}
			/>
		</>
	);
}

import type { Mat } from "@/types/opencv";

interface PreprocessOptions {
	morphologyLimit?: number;
	tileGridSize?: number;
	adaptiveBlockSize?: number;
	adaptiveC?: number;
	morphologyLimitOpen?: number;
	morphologyLimitClose?: number;
	morphologyLimitFinish?: number;
	medianLimit: number;
}

/**
 * OCR 前処理パイプライン
 * 呼び出し元で .delete() を忘れるな！
 * @param srcColor Mat (RGBA) — 入力カラー画像
 * @param cv OpenCV.js CV オブジェクト
 * @returns 二値化後の Mat
 */
function preprocessForOcr(cv: CV, src: Mat, options?: PreprocessOptions): Mat {
	const {
		morphologyLimit = 2.0,
		tileGridSize = 6,
		adaptiveBlockSize = 11,
		adaptiveC = 2,
		morphologyLimitOpen,
		morphologyLimitClose,
		morphologyLimitFinish,
		medianLimit = 3,
	} = options || {};

	// ここで作るMatたちを全部初期化
	const gray = new cv.Mat();
	const enhanced = new cv.Mat();
	const bin = new cv.Mat();
	const denoised = new cv.Mat();
	const clahe = new cv.CLAHE(2.0, new cv.Size(tileGridSize, tileGridSize));

	const open = morphologyLimitOpen ?? morphologyLimit;
	const close = morphologyLimitClose ?? morphologyLimit;
	const finish = morphologyLimitFinish ?? morphologyLimit;
	const kernelOpen = cv.getStructuringElement(
		cv.MORPH_RECT,
		new cv.Size(open, open),
	);
	const kernelClose = cv.getStructuringElement(
		cv.MORPH_RECT,
		new cv.Size(close, close),
	);
	const kernelFinish = cv.getStructuringElement(
		cv.MORPH_RECT,
		new cv.Size(finish, finish),
	);

	try {
		// 1. グレースケール化
		cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

		// 2. CLAHE: 適応ヒストグラム平坦化
		clahe.apply(gray, enhanced);

		// cv.bilateralFilter(gray, denoised, 9, 75, 75);

		// 3. 適応的二値化
		cv.adaptiveThreshold(
			enhanced,
			bin,
			255,
			cv.ADAPTIVE_THRESH_GAUSSIAN_C,
			cv.THRESH_BINARY,
			adaptiveBlockSize,
			adaptiveC,
		);

		// 4. 形態学的変換（OPEN -> CLOSE）
		cv.morphologyEx(bin, bin, cv.MORPH_OPEN, kernelOpen);
		cv.morphologyEx(bin, bin, cv.MORPH_CLOSE, kernelClose);

		// 5. メディアンフィルタ
		cv.medianBlur(bin, denoised, medianLimit);

		// 6. 最終Morphology（もう一度OPEN）
		cv.morphologyEx(bin, denoised, cv.MORPH_OPEN, kernelFinish);

		// 🔥 denoisedだけ呼び出し元に渡す
		return denoised.clone(); // 呼び出し元で delete() してね
	} catch (e) {
		if (e instanceof Error) {
			console.error(e.message);
			throw e;
		}
		console.error("Unknown error", e);
		throw new Error("Unknown error during OpenCV processing");
	} finally {
		// 🎯 例外が出ても必ずdelete
		gray.delete();
		enhanced.delete();
		bin.delete();
		denoised.delete();
		clahe.delete();
		kernelOpen.delete();
		kernelClose.delete();
		kernelFinish.delete();
	}
}

interface DeskewOptions {
	cannyThreshold1?: number;
	cannyThreshold2?: number;
}

/**
 * deskew（傾き補正）前処理パイプライン
 * 呼び出し元で .delete() を忘れるな！
 * @param srcColor Mat (RGBA) — 入力カラー画像
 * @param cv OpenCV.js CV オブジェクト
 * @param options - オプション（Cannyの閾値など）
 * @returns 傾き補正後のカラー Mat
 */
// function preprocessForDeskew(
// 	cv: CV,
// 	srcColor: Mat,
// 	options?: DeskewOptions,
// ): Mat {
// 	const { cannyThreshold1 = 50, cannyThreshold2 = 150 } = options || {};

// 	// Matたちを初期化
// 	const gray = new cv.Mat();
// 	const binary = new cv.Mat();
// 	const edges = new cv.Mat();
// 	const contours = new cv.MatVector();
// 	const hierarchy = new cv.Mat();
// 	const deskewed = new cv.Mat();

// 	try {
// 		// 1. グレースケール化
// 		cv.cvtColor(srcColor, gray, cv.COLOR_RGBA2GRAY);

// 		// 2. 二値化（単純なしきい値、仮）
// 		cv.threshold(gray, binary, 127, 255, cv.THRESH_BINARY);

// 		// 3. エッジ検出（Canny）
// 		cv.Canny(binary, edges, cannyThreshold1, cannyThreshold2);

// 		// 4. 輪郭検出
// 		cv.findContours(
// 			edges,
// 			contours,
// 			hierarchy,
// 			cv.RETR_EXTERNAL,
// 			cv.CHAIN_APPROX_SIMPLE,
// 		);

// 		if (contours.size() === 0) {
// 			throw new Error("No contours found for deskewing");
// 		}

// 		// 5. 最大輪郭を取得
// 		let largestContour = contours.get(0);
// 		let maxArea = cv.contourArea(largestContour);

// 		for (let i = 1; i < contours.size(); i++) {
// 			const cnt = contours.get(i);
// 			const area = cv.contourArea(cnt);
// 			if (area > maxArea) {
// 				largestContour = cnt;
// 				maxArea = area;
// 			}
// 		}

// 		// 6. 外接矩形から角度を取得
// 		const rotatedRect = cv.minAreaRect(largestContour);
// 		let angle = rotatedRect.angle;
// 		if (angle < -45) {
// 			angle += 90;
// 		}

// 		// 7. 回転補正（deskew）
// 		const center = new cv.Point(srcColor.cols / 2, srcColor.rows / 2);
// 		const M = cv.getRotationMatrix2D(center, angle, 1.0);
// 		cv.warpAffine(
// 			srcColor,
// 			deskewed,
// 			M,
// 			new cv.Size(srcColor.cols, srcColor.rows),
// 			cv.INTER_LINEAR,
// 			cv.BORDER_CONSTANT,
// 			new cv.Scalar(),
// 		);

// 		M.delete();

// 		// 🔥 deskewedだけ呼び出し元に渡す
// 		return deskewed.clone(); // 呼び出し元で delete() してね
// 	} catch (e) {
// 		if (e instanceof Error) {
// 			console.error(e.message);
// 			throw e;
// 		}
// 		console.error("Unknown error", e);
// 		throw new Error("Unknown error during OpenCV deskewing");
// 	} finally {
// 		// 🎯 例外が出ても必ずdelete
// 		gray.delete();
// 		binary.delete();
// 		edges.delete();
// 		contours.delete();
// 		hierarchy.delete();
// 		deskewed.delete();
// 	}
// }
