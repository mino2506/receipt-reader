export const hasTag =
	<T extends string>(tag: T): ((e: unknown) => e is { _tag: T }) =>
	(e): e is { _tag: T } =>
		typeof e === "object" &&
		e !== null &&
		"_tag" in e &&
		// biome-ignore lint/suspicious/noExplicitAny: 型ガード用
		(e as any)._tag === tag;
