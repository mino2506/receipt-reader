import OpenCv from "@/app/components/receipt/OpenCv";
import Script from "next/script";

export default function OcrPage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<OpenCv />
		</div>
	);
}
