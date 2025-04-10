export function enumValues<T extends Record<string, string | number>>(
	e: T,
): T[keyof T][] {
	return Object.values(e).filter((v) => typeof v === "number") as T[keyof T][];
}
