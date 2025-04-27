"use client";

import { OpenCvLoader } from "@/app/components/OpenCvLoader";
import { Button } from "@/components/ui/button";
import type { CV } from "@/types/opencv";
import { useState } from "react";

const runTest = (cv: CV) => {
	console.log("📦 getBuildInformation:", cv.getBuildInformation());

	const mat = new cv.Mat(100, 100, cv.CV_8UC1);
	cv.rectangle(mat, { x: 10, y: 10 }, { x: 90, y: 90 }, new cv.Scalar(255), 2);
	console.log("🧪 mat.rows:", mat.rows, "cols:", mat.cols);

	mat.delete();
	console.log("🗑️ mat deleted");
};

export default function OcrPage() {
	const [cv, setCv] = useState<CV | null>(null);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<OpenCvLoader
				onReady={(cv) => {
					setCv(cv);
				}}
			/>
			{cv && <Button onClick={() => runTest(cv)}>runTest</Button>}
		</div>
	);
}
