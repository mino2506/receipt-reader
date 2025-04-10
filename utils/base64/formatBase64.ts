import {
	type Base64,
	type Base64Image,
	type PureBase64,
	type PureBase64Image,
	type Url,
	UrlSchema,
} from ".";

export const base64Regex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+$/;
export const base64PrefixRegex = /^data:image\/[a-zA-Z]+;base64,/;
export const base64ImageRegex =
	/^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/;
export const base64ImagePrefixRegex =
	/^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
export const pureBase64Regex = /^[A-Za-z0-9+/=]+$/;

export const convertToBase64 = (file: File): Promise<Base64> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result as Base64);
		reader.onerror = (error) => reject(error);
	});
};

export const isBase64 = (value: unknown): value is Base64 => {
	return typeof value === "string" && base64Regex.test(value);
};
export const isBase64Image = (value: unknown): value is Base64Image => {
	return typeof value === "string" && base64ImageRegex.test(value);
};
export const isPureBase64ImageBrand = (
	value: unknown,
): value is PureBase64Image => {
	return typeof value === "string" && pureBase64Regex.test(value);
};

export const toPureBase64 = (base64: Base64): PureBase64 => {
	return base64.replace(base64PrefixRegex, "") as PureBase64;
};
export const toPureBase64Image = (
	base64Image: Base64Image,
): PureBase64Image => {
	return base64Image.replace(base64ImagePrefixRegex, "") as PureBase64Image;
};

export const isUrl = (value: unknown): boolean => {
	return typeof value === "string" && UrlSchema.safeParse(value).success;
};

export const isUrlType = (value: unknown): value is Url => {
	return typeof value === "string" && UrlSchema.safeParse(value).success;
};
