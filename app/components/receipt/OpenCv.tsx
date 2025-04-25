"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function OpenCvExample() {
	const [ready, setReady] = useState(false);
	const [cv, setCv] = useState<any>(null);

	const handleReady = () => {
		const cvMaybe = window.cv;

		if (!cvMaybe) return;

		if (cvMaybe instanceof Promise) {
			cvMaybe.then((resolved) => {
				window.cv = resolved;
				setCv(resolved);
				setReady(true);
				runTest(resolved);
			});
		} else if (typeof cvMaybe.getBuildInformation === "function") {
			setCv(cvMaybe);
			setReady(true);
			runTest(cvMaybe);
		} else if ("onRuntimeInitialized" in cvMaybe) {
			cvMaybe.onRuntimeInitialized = () => {
				setCv(cvMaybe);
				setReady(true);
				runTest(cvMaybe);
			};
		} else {
			console.error("❌ OpenCV初期化失敗（形式不明）");
		}
	};

	// OpenCVが使えるようになった後に実行する簡単な処理
	const runTest = (cv: any) => {
		console.log("📦 getBuildInformation:", cv.getBuildInformation());

		const mat = new cv.Mat(100, 100, cv.CV_8UC1);
		cv.rectangle(
			mat,
			{ x: 10, y: 10 },
			{ x: 90, y: 90 },
			new cv.Scalar(255),
			2,
		);
		console.log("🧪 mat.rows:", mat.rows, "cols:", mat.cols);

		mat.delete();
		console.log("🗑️ mat deleted");
	};

	return (
		<>
			<Script
				src="https://docs.opencv.org/4.11.0/opencv.js"
				strategy="afterInteractive"
				onLoad={handleReady}
				onError={() => console.error("❌ OpenCV.jsの読み込みに失敗")}
			/>
			<div>{ready ? "✅ OpenCV準備完了！" : "⏳ OpenCV初期化中..."}</div>
		</>
	);
}
