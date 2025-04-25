"use client";

import { CameraStreamController } from "@/app/components/CameraCapture/CameraStreamController";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertCircle,
	Camera,
	CheckCircle,
	RefreshCw,
	RotateCcw,
} from "lucide-react";
import { useRef, useState } from "react";

interface CameraCaptureDialogProps {
	onSubmit: (base64Image: string) => void;
	triggerText?: string;
	title?: string;
}

export function CameraCaptureDialog({
	onSubmit,
	triggerText = "写真を撮影",
	title = "カメラキャプチャ",
}: CameraCaptureDialogProps) {
	const [error, setError] = useState<string | null>(null);
	const [open, setOpen] = useState(false);
	const [capturedImage, setCapturedImage] = useState<string | null>(null);
	const [rotation, setRotation] = useState<number>(0); // 回転角度（0, 90, 180, 270）
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const handleCapture = () => {
		const video = videoRef.current;
		const canvas = canvasRef.current;
		if (!video || !canvas || video.readyState < 2) {
			setError("カメラ映像が準備できていません");
			return;
		}

		const w = video.videoWidth;
		const h = video.videoHeight;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		if (rotation % 180 === 0) {
			canvas.width = w;
			canvas.height = h;
		} else {
			canvas.width = h;
			canvas.height = w;
		}

		ctx.save();
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// 回転処理
		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.rotate((rotation * Math.PI) / 180);
		ctx.drawImage(video, -w / 2, -h / 2, w, h);
		ctx.restore();

		const base64 = canvas.toDataURL("image/png");
		setCapturedImage(base64);
	};

	const handleRetake = () => {
		setCapturedImage(null);
	};

	const handleSubmit = () => {
		if (capturedImage) {
			onSubmit(capturedImage);
			setOpen(false);
			setCapturedImage(null);
			setRotation(0);
		}
	};

	const rotateClockwise = () => {
		setRotation((prev) => (prev + 90) % 360);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="flex items-center gap-2">
					<Camera className="w-5 h-5" />
					{triggerText}
				</Button>
			</DialogTrigger>

			<DialogContent className="w-[90vw] max-w-none max-h-[90vh] space-y-4">
				<p id="dialog-desc" className="sr-only">
					カメラキャプチャモーダルです
				</p>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>

				{error && (
					<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
						<AlertCircle className="w-4 h-4" />
						{error}
					</div>
				)}

				{!capturedImage ? (
					<div className="flex flex-col gap-2">
						<Button
							onClick={rotateClockwise}
							variant="ghost"
							size="icon"
							className="absolute top-10 right-10"
							title="回転"
						>
							<RotateCcw />
						</Button>
						<div className="relative w-full flex justify-center items-center overflow-hidden object-contain">
							<div
								className={`relative ${
									rotation % 180 === 0
										? "w-full h-auto scale-150"
										: "h-[75vh] w-auto scale-150"
								}`}
								style={{ transform: `rotate(${rotation}deg)` }}
							>
								<video
									ref={videoRef}
									autoPlay
									playsInline
									muted
									className="block w-full h-full object-contain"
								/>
							</div>
						</div>
						<Button onClick={handleCapture} className="w-full">
							<Camera className="w-5 h-5 mr-1" />
							撮影する
						</Button>
					</div>
				) : (
					<div className="flex flex-col gap-2">
						<img
							src={capturedImage}
							alt="Captured"
							className="max-w-full max-h-[75vh] mx-auto rounded border"
						/>
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={handleRetake}
								className="flex-1"
							>
								<RefreshCw className="w-4 h-4 mr-1" />
								撮り直す
							</Button>
							<Button onClick={handleSubmit} className="flex-1">
								<CheckCircle className="w-4 h-4 mr-1" />
								確定する
							</Button>
						</div>
					</div>
				)}

				<canvas ref={canvasRef} className="hidden" />
			</DialogContent>
			<CameraStreamController
				videoRef={videoRef}
				isActive={open && !capturedImage}
			/>
		</Dialog>
	);
}
