export function enumKeys<T extends Record<string, string | number>>(e: T) {
	const keys = Object.keys(e).filter((k) =>
		Number.isNaN(Number(k)),
	) as (keyof T)[];

	if (keys.length === 0) {
		throw new Error("Enum must have at least one key");
	}

	return keys as [keyof T, ...(keyof T)[]];
}
