/**
 * 指定されたブランドキー K を T 型に付与した型を表す
 * ブランド型として識別される目的で __kind を付加する
 */
export type Branded<T, K extends readonly string[]> = T & { __kind: K };

/**
 * U が T に含まれているかを判定するユーティリティ型
 */
export type Includes<
	T extends readonly string[],
	U extends string,
> = U extends T[number] ? true : false;

/**
 * 2つのブランドキー配列をマージする型
 * 重複は排除され、元の順序を保つ
 */
export type MergeKind<
	T extends readonly string[],
	U extends readonly string[],
	Acc extends readonly string[] = [],
> = U extends [infer H, ...infer R]
	? H extends string
		? R extends string[]
			? Includes<T, H> extends true
				? MergeKind<T, R, Acc>
				: MergeKind<T, R, [...Acc, H]>
			: Acc
		: Acc
	: [...T, ...Acc];

/**
 * ブランド対象として許容される型のみを許す
 * string, number, bigint, 配列 に限定し、その他は never に変換する
 * → ブランド対象外の型を extendKindTuple に渡すと型エラーになる
 */
// biome-ignore format:
type Brandable<T> =// biome-ignore format:
	T extends string ? string :// biome-ignore format:
	T extends number ? number :// biome-ignore format:
	T extends bigint ? bigint :// biome-ignore format:
	// biome-ignore lint/suspicious/noExplicitAny: 配列かどうかを安全に判定しつつ、要素型を保持するため any[] を明示的に使用
	T extends any[] ? T :// biome-ignore format:
	never; // biome-ignore format:

/**
 * 指定した値にブランドキーを追加する
 *
 * @param value - 対象となる値。既に __kind を持っていても上書きする
 * @param kinds - 追加するブランドキー。すでに存在するものは重複除去される
 * @returns ブランドキーが追加された値（Branded<T, K[]>）
 *
 * @example
 * const base64 = extendKindTuple("abc", "base64");
 * const image = extendKindTuple(base64, "image");
 *
 * @remarks
 * - プリミティブ（string, number, bigint, array）以外を渡すと 型が never に評価され使用できなくなります
 * - 戻り値はプリミティブラップ（例：Numberオブジェクト）になります
 * - 加算/比較演算/文字列結合 を行うと .valueOf によりブランド情報（__kind）は消えます
 * - 配列に対して map/filter/slice/spread など非破壊操作を行うと __kind は失われます（再ブランド化が必要）
 * - 値を clone しただけでは __kind は維持されます（参照同一）
 * - ホバー表示は Branded<string, [...]> の形式に収まり、読みやすさを保ちます
 */
export function extendKindTuple<
	T,
	Prev extends readonly string[] = [],
	New extends readonly string[] = [],
>(
	value: T & { __kind?: Prev },
	...kinds: New
): Branded<
	Brandable<T> extends never ? never : Brandable<T>,
	MergeKind<Prev, New>
> {
	// biome-ignore lint/suspicious/noExplicitAny: __kind は動的に付加されるブランド情報であり型安全にアクセスできないため
	const base = value as any;

	const current = Array.isArray(base.__kind) ? (base.__kind as string[]) : [];
	const uniqueAdded = kinds.filter((k) => !current.includes(k));
	const next = [...current, ...uniqueAdded] as MergeKind<Prev, New>;
	return Object.assign(base, { __kind: next }) as Branded<
		Brandable<T> extends never ? never : Brandable<T>,
		MergeKind<Prev, New>
	>;
}

/**
 * ブランドキーを持つかどうかを判定するランタイム型ガード
 *
 * @param value - 判定対象の任意の値
 * @param kinds - 含まれているか確認するブランドキー配列
 * @returns 判定結果。全てのキーが含まれていれば true
 */
export function hasKind<T>(
	value: unknown,
	kinds: string[],
): value is T & { __kind: string[] } {
	return (
		value !== null &&
		typeof value !== "undefined" &&
		"__kind" in Object(value) &&
		// biome-ignore lint/suspicious/noExplicitAny: __kind は動的に付加されるブランド情報であり型安全にアクセスできないため
		Array.isArray((value as any).__kind) &&
		// biome-ignore lint/suspicious/noExplicitAny: __kind は動的に付加されるブランド情報であり型安全にアクセスできないため
		kinds.every((k) => (value as any).__kind.includes(k))
	);
}

export function hasExactKind<T>(
	value: unknown,
	kinds: string[],
): value is T & { __kind: string[] } {
	const actual = getKind(value);
	if (!actual) return false;
	return (
		actual.length === kinds.length && kinds.every((k, i) => actual[i] === k)
	);
}

export function getKind(value: unknown): string[] | undefined {
	if (
		value !== null &&
		typeof value === "object" &&
		"__kind" in value &&
		// biome-ignore lint/suspicious/noExplicitAny: __kind は動的に付加されるブランド情報であり型安全にアクセスできないため
		Array.isArray((value as any).__kind)
	) {
		// biome-ignore lint/suspicious/noExplicitAny: __kind は動的に付加されるブランド情報であり型安全にアクセスできないため
		return (value as any).__kind;
	}
	return undefined;
}
