"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReceiptImage() {
	const router = useRouter();
	return (
		<div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
			<h3>image</h3>
			<div className="flex items-center justify-center w-full">
				<Image
					src="/receipt_sample.jpg"
					alt="receipt image"
					width={300}
					height={300}
				/>
			</div>
		</div>
	);
}
