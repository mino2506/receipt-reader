"use client";

import { computeUnionBoundingBox } from "@/app/utils/computeUnionBoundingBox";
import { extractTextWithBoundingBox } from "@/app/utils/getBoundingBox";
import sampleReceiptMultiLine from "@/sampleReceiptMultiLine.json";
import type { google } from "@google-cloud/vision/build/protos/protos";

const receiptRawResponse: google.cloud.vision.v1.IAnnotateImageResponse =
	sampleReceiptMultiLine as google.cloud.vision.v1.IAnnotateImageResponse;

const receiptFullTextAnnotation =
	receiptRawResponse.fullTextAnnotation as google.cloud.vision.v1.ITextAnnotation;

const Recipt = () => {
	console.log(extractTextWithBoundingBox(receiptFullTextAnnotation));
	return (
		<>
			<div>Recipt</div>
			<button
				type="button"
				onClick={() =>
					alert(
						JSON.stringify(
							extractTextWithBoundingBox(receiptFullTextAnnotation),
						),
					)
				}
			>
				Button
			</button>
		</>
	);
};

export default Recipt;
