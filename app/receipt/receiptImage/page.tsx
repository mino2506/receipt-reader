import ImageUploader from "@/app/components/ImageUploader";
import TestCreateReceiptPage from "../create/page";

export default function ReceiptImage() {
	return (
		<div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
			<TestCreateReceiptPage />
			<ImageUploader />
		</div>
	);
}
