"use client";

import type { CV } from "@/types/opencv";

import Script from "next/script";
import { useState } from "react";

const runTest = (cv: CV) => {
	console.log("📦 getBuildInformation:", cv.getBuildInformation());

	const mat = new cv.Mat(100, 100, cv.CV_8UC1);
	cv.rectangle(mat, { x: 10, y: 10 }, { x: 90, y: 90 }, new cv.Scalar(255), 2);
	console.log("🧪 mat.rows:", mat.rows, "cols:", mat.cols);

	mat.delete();
	console.log("🗑️ mat deleted");
};

interface OpenCvLoaderProps {
	onReady: (cv: CV) => void;
}

export function OpenCvLoader({ onReady }: OpenCvLoaderProps) {
	const [error, setError] = useState<string | null>(null);

	const handleReady = () => {
		const cvMaybe = window.cv;

		if (!cvMaybe) {
			setError("window.cvが見つかりません");
			return;
		}

		if (cvMaybe instanceof Promise) {
			cvMaybe.then((resolved) => {
				window.cv = resolved;
				onReady(resolved);
				runTest(resolved);
			});
		} else if (typeof cvMaybe.getBuildInformation === "function") {
			onReady(cvMaybe);
			runTest(cvMaybe);
		} else if ("onRuntimeInitialized" in cvMaybe) {
			cvMaybe.onRuntimeInitialized = () => {
				onReady(cvMaybe);
				runTest(cvMaybe);
			};
		} else {
			setError("不明のエラー: OpenCVの初期化に失敗しました");
		}
	};

	return (
		<>
			<Script
				src="https://docs.opencv.org/4.11.0/opencv.js"
				strategy="afterInteractive"
				onLoad={handleReady}
				onError={() => console.error("❌ OpenCV.jsの読み込みに失敗")}
			/>
			{error && <div className="text-red-500 text-sm">{error}</div>}
		</>
	);
}
