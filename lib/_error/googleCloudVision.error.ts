export type GcvLimitExceededError = {
	_tag: "GcvLimitExceededError";
	message: string;
	limit: number;
};

export type GCVError = GcvLimitExceededError;
