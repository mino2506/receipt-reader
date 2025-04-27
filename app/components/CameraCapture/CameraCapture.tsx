"use client";

import type { CV } from "@/types/opencv";
import { useRef, useState } from "react";

import { CameraStreamController } from "@/app/components/CameraCapture/CameraStreamController";
import { OpenCvLoader } from "@/app/components/OpenCvLoader";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
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
import { CameraPreviewCanvas } from "./CameraPreviewCanvas";

interface CameraCaptureDialogProps {
	onSubmit: (base64Image: string) => void;
	triggerText?: string;
	title?: string;
}

export function CameraCaptureDialog({
	onSubmit,
	triggerText = "写真を撮る",
	title = "",
}: CameraCaptureDialogProps) {
	const [cv, setCv] = useState<CV | null>(null);
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
					<span className="hidden md:flex">{triggerText}</span>
				</Button>
			</DialogTrigger>

			<DialogContent className="w-[90vw] max-w-none max-h-[90vh] space-y-4">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription className="sr-only">
						カメラキャプチャモーダルです
					</DialogDescription>
				</DialogHeader>

				{/* {rotation} */}
				<CameraPreviewCanvas
					cv={cv}
					videoRef={videoRef}
					rotation={rotation}
					isActive={open && !capturedImage}
					onError={setError}
				/>

				{!capturedImage ? (
					<div className="flex flex-col gap-2">
						<Button
							onClick={rotateClockwise}
							variant="ghost"
							className="absolute top-15 right-10"
							title="回転"
						>
							<RotateCcw />
						</Button>
						<Button onClick={handleCapture} className="w-full">
							<Camera className="w-5 h-5 mr-1" />
							撮影する
						</Button>
					</div>
				) : (
					<div className="flex flex-col gap-2">
						{/* <img
							src={capturedImage}
							alt="Captured"
							className="max-w-full max-h-[75vh] mx-auto rounded border"
						/> */}
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
				{error && (
					<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
						<AlertCircle className="w-4 h-4" />
						{error}
					</div>
				)}
				<video ref={videoRef} autoPlay playsInline muted className="hidden" />
				<canvas ref={canvasRef} className="hidden" />
			</DialogContent>
			<OpenCvLoader onReady={setCv} />
			<CameraStreamController
				videoRef={videoRef}
				isActive={open && !capturedImage}
			/>
		</Dialog>
	);
}
