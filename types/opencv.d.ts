declare global {
	interface Window {
		cv: CV | Promise<CV> | undefined;
	}
}

export interface CV {
	getBuildInformation(): string;

	Mat: new (rows: number, cols: number, type: number) => Mat;
	Scalar: new (...args: number[]) => Scalar;
	rectangle: (
		img: Mat,
		pt1: { x: number; y: number },
		pt2: { x: number; y: number },
		color: Scalar,
		thickness?: number,
		lineType?: number,
		shift?: number,
	) => void;

	CV_8UC1: number;
	ROTATE_90_CLOCKWISE: number;
	// 他にも必要に応じて追加（rotate, imshow, VideoCaptureなど）
}

export interface Mat {
	rows: number;
	cols: number;
	delete(): void;
	// その他、必要に応じて追加
}

// export interface Scalar {
// 	// OpenCV.jsのScalarはただの [r, g, b, a] なのでクラスではない
// }
