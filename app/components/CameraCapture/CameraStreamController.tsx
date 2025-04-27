import { useEffect } from "react";

interface StreamConfig {
	video: {
		facingMode: "environment" | "user";
		width: number;
		height: number;
	};
	audio: boolean;
}

const DEFAULT_STREAM_CONFIG: StreamConfig = {
	video: {
		facingMode: "environment",
		width: 1280,
		height: 720,
	},
	audio: false,
};

export interface CameraStreamControllerProps {
	videoRef: React.RefObject<HTMLVideoElement | null>;
	streamConfig?: StreamConfig;
	isActive: boolean;
}

/**
 * カメラ制御コンポーネント（UIなし）
 *
 * @param videoRef - 映像を表示する video 要素の参照
 * @param streamConfig - MediaStream の取得条件
 * @param isActive - 起動状態のフラグ。true で起動、false で停止
 *
 * @example
 * ```tsx
 * <CameraStreamController
 *   videoRef={videoRef}
 *   streamConfig={{ video: { facingMode: "environment", width: 1280, height: 720 }, audio: false }}
 *   isActive={open}
 * />
 * ```
 *
 * @see CameraStreamControllerProps - コンポーネントの受け取るprops型
 */
export function CameraStreamController({
	videoRef,
	streamConfig = DEFAULT_STREAM_CONFIG,
	isActive,
}: CameraStreamControllerProps) {
	useEffect(() => {
		let stream: MediaStream | null = null;

		const startCamera = async () => {
			try {
				stream = await navigator.mediaDevices.getUserMedia(streamConfig);
				if (videoRef.current) {
					videoRef.current.srcObject = stream;

					// dailog の同期ずれ防止のため、少し待ってから再生
					setTimeout(() => {
						videoRef.current?.play().catch((e) => {
							console.error("📷 カメラ再生失敗:", e);
						});
					}, 0);
				}
			} catch (e) {
				console.error("📷 カメラ起動失敗:", e);
			}
		};

		const stopCamera = () => {
			if (videoRef.current?.srcObject instanceof MediaStream) {
				for (const track of videoRef.current.srcObject.getTracks()) {
					track.stop();
				}
			}
			if (videoRef.current) {
				videoRef.current.srcObject = null;
			}
			stream = null;
		};

		if (isActive) {
			startCamera();
		} else {
			stopCamera();
		}

		return () => {
			stopCamera();
		};
	}, [isActive, videoRef, streamConfig]);

	return null;
}
