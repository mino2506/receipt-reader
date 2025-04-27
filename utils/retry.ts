import { isError } from "./isError";

export async function retry<T>(
	fn: () => Promise<T>,
	retries = 3,
	delayMs = 500,
): Promise<T> {
	let lastError: Error = new Error("Unknown error");

	for (let attempt = 0; attempt < retries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			if (isError(error)) {
				lastError = error;
			} else {
				lastError = new Error(String(error));
			}
			console.warn(`Retrying (${attempt + 1}/${retries})...`);
			await new Promise((res) => setTimeout(res, delayMs));
		}
	}

	throw lastError;
}
