"use client";

import { useEffect, useState } from "react";

// window.cv の型定義を追加
declare global {
	interface Window {
		cv?: any;
	}
}

// OpenCV.jsを一度だけ読み込むためのPromise
let cvPromise: Promise<any> | undefined;

/**
 * OpenCV.jsをロードして初期化が完了するまで待機する
 * @returns OpenCVモジュール（cv）
 */
export function loadOpenCV(): Promise<any> {
	if (!cvPromise) {
		cvPromise = new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.src = "/opencv_version.js";
			script.async = true;

			script.onload = () => {
				const checkReady = () => {
					if (window.cv) {
						if (window.cv instanceof Promise) {
							window.cv.then((module: any) => {
								window.cv = module;
								resolve(window.cv);
							});
						} else if (typeof window.cv.getBuildInformation === "function") {
							resolve(window.cv);
						} else if ("onRuntimeInitialized" in window.cv) {
							window.cv.onRuntimeInitialized = () => resolve(window.cv);
						} else {
							setTimeout(checkReady, 100); // 少し待って再チェック
						}
					} else {
						setTimeout(checkReady, 100); // window.cv未定義の場合も待機
					}
				};

				checkReady();
			};

			script.onerror = () =>
				reject(new Error("OpenCV.jsのスクリプトロード失敗"));

			document.head.appendChild(script);
		});
	}
	return cvPromise;
}

interface OpenCvReady {
	ready: boolean;
	cv: any;
}

/**
 * OpenCV.jsをReactフックとして利用
 * @returns OpenCVの準備完了状態（ready）
 */
export async function useOpenCv() {
	const [ready, setReady] = useState<boolean>(false);
	const [cv, setCv] = useState<any>(null);

	useEffect(() => {
		loadOpenCV()
			.then((cv) => {
				setReady(true);
				setCv(cv);
			})
			.catch((err) => console.error(err));
	}, []);

	return { ready, cv };
}
