"use client";

import sampleReceiptMultiLine from "@/sampleReceiptMultiLine.json";
import { extractTextWithBoundingBox } from "@/utils/getBoundingBox";
import type { google } from "@google-cloud/vision/build/protos/protos";

const receiptRawResponse: google.cloud.vision.v1.IAnnotateImageResponse =
	sampleReceiptMultiLine as google.cloud.vision.v1.IAnnotateImageResponse;

const receiptFullTextAnnotation =
	receiptRawResponse.fullTextAnnotation as google.cloud.vision.v1.ITextAnnotation;

const Recipt = () => {
	const receiptObject = extractTextWithBoundingBox(receiptFullTextAnnotation);

	console.log(receiptObject);
	return (
		<>
			<div>Recipt</div>
			<button
				type="button"
				onClick={() => alert(JSON.stringify(receiptObject))}
			>
				Button
			</button>
			<div>
				{receiptObject.map((item) => (
					<>
						<div key={"text"}>{item.text}</div>
						<div key={"vertices"}>
							{JSON.stringify(item.boundingBox?.vertices)}
						</div>
					</>
				))}
			</div>
		</>
	);
};

export default Recipt;
