declare global {
	interface Window {
		cv: CV | Promise<CV> | undefined;
	}
}

export interface Point {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

/**
 * Scalarは要素数可変の数値配列として扱います
 */
export interface Scalar extends Array<number> {}

/**
 * OpenCV.jsの行列オブジェクト
 */
export interface Mat {
	rows: number;
	cols: number;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	data: any;

	delete(): void;
	copyTo(dst: Mat): void;
	clone(): Mat;
	empty(): boolean;
	type(): number;
	size(): Size;
}

/**
 * VideoCapture ラッパー
 */
export interface VideoCapture {
	read(mat: Mat): void;
}

/**
 * CLAHE （Contrast Limited Adaptive Histogram Equalization）
 */
export interface CLAHE {
	apply(src: Mat, dst: Mat): void;
	delete(): void;
}

/**
 * OpenCV.js のグローバル cv オブジェクト型
 */
export interface CV {
	getBuildInformation(): string;

	// Core classes
	Mat: {
		new (): Mat;
		new (rows: number, cols: number, type: number): Mat;
	};
	Size: new (width: number, height: number) => Size;
	Scalar: new (...args: number[]) => Scalar;
	CLAHE: new (clipLimit: number, tileGridSize: Size) => CLAHE;
	VideoCapture: new (videoElement: HTMLVideoElement) => VideoCapture;

	// Drawing
	rectangle(
		img: Mat,
		pt1: Point,
		pt2: Point,
		color: Scalar,
		thickness?: number,
		lineType?: number,
		shift?: number,
	): void;

	// Image operations
	rotate(src: Mat, dst: Mat, rotateCode: number): void;
	imshow(canvas: HTMLCanvasElement | string, mat: Mat): void;
	imread(canvas: HTMLCanvasElement | string): Mat;
	matFromImageData(imgData: ImageData): Mat;
	cvtColor(src: Mat, dst: Mat, code: number): void;
	threshold(
		src: Mat,
		dst: Mat,
		thresh: number,
		maxVal: number,
		type: number,
	): number;
	adaptiveThreshold(
		src: Mat,
		dst: Mat,
		maxValue: number,
		adaptiveMethod: number,
		thresholdType: number,
		blockSize: number,
		C: number,
	): void;
	morphologyEx(
		src: Mat,
		dst: Mat,
		op: number,
		kernel: Mat,
		anchor?: Point,
		iterations?: number,
		borderType?: number,
		borderValue?: Scalar,
	): void;
	medianBlur(src: Mat, dst: Mat, ksize: number): void;
	getStructuringElement(shape: number, ksize: Size, anchor?: Point): Mat;

	// Analysis
	mean(mat: Mat, mask?: Mat): Scalar;
	countNonZero(src: Mat): number;
	minMaxLoc(src: Mat): {
		minVal: number;
		maxVal: number;
		minLoc: Point;
		maxLoc: Point;
	};
	calcHist(
		src: Mat[],
		channels: number[],
		mask: Mat | null,
		hist: Mat,
		histSize: number[],
		ranges: number[],
	): void;

	// Constants
	CV_8UC1: number;
	CV_8UC4: number;
	ROTATE_90_CLOCKWISE: number;
	ROTATE_180: number;
	ROTATE_90_COUNTERCLOCKWISE: number;
	COLOR_RGBA2GRAY: number;
	THRESH_BINARY: number;
	ADAPTIVE_THRESH_MEAN_C: number;
	ADAPTIVE_THRESH_GAUSSIAN_C: number;
	MORPH_OPEN: number;
	MORPH_CLOSE: number;
	MORPH_RECT: number;
}
