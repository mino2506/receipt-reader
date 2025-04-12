import {
	type Branded,
	extendKindTuple,
	hasExactKind,
	hasKind,
} from "@/utils/generics/brand";

export enum ImageMimeType {
	Png = "png",
	Jpeg = "jpeg",
	Jpg = "jpg",
	Gif = "gif",
	Webp = "webp",
}

export const isSupportedMimeType = (v: string): v is ImageMimeType =>
	Object.values(ImageMimeType).includes(v as ImageMimeType);

const mimePatternImage = Object.values(ImageMimeType).join("|"); // "png|jpeg|jpg|gif|webp"

export const pureBase64Regex = /^[A-Za-z0-9+/=]+$/;
export const base64PrefixRegex =
	/^data:[a-zA-Z0-9.+-]+\/[a-zA-Z0-9.+-]+;base64,/;
export const base64Regex = new RegExp(
	base64PrefixRegex.source + pureBase64Regex.source,
);
export const base64ImageRegex = new RegExp(
	`^data:image/(${mimePatternImage});base64,[A-Za-z0-9+/=]+$`,
);

export const base64ImagePrefixRegex = new RegExp(
	`^data:image/(${mimePatternImage});base64,`,
);

export type Base64Kind<K extends readonly string[]> = Branded<string, K>;

export type Base64Brand = Base64Kind<["base64"]>;
export type PureBase64Brand = Base64Kind<["base64", "pure"]>;
export type Base64ImageBrand = Base64Kind<["base64", "image"]>;
export type PureBase64ImageBrand = Base64Kind<["base64", "image", "pure"]>;

const createBase64 = (v: string) => {
	if ((v as any).__kind?.includes("pure")) {
		throw new Error(
			"[createBase64] pure を含んだ状態から base64 に変換するのは非推奨です",
		);
	}
	return extendKindTuple(v, "base64");
};
const createBase64Image = (v: string) => {
	if (hasKind(v, ["pure"])) {
		throw new Error(
			"[createBase64Image] pure を含んだ状態から base64 image に変換するのは非推奨です",
		);
	}
	return extendKindTuple(createBase64(v), "image");
};
const createPureBase64 = (v: string) =>
	extendKindTuple(createBase64(v), "pure");
const createPureBase64Image = (v: string) => {
	if (hasKind(v, ["pure"]) && !hasKind(v, ["image"])) {
		throw new Error(
			"[createBase64] image を含まず pure を含んだ状態から base64 image pure に変換するのは非推奨です",
		);
	}
	return extendKindTuple(
		createBase64Image(v),
		"pure",
	) satisfies PureBase64ImageBrand;
};

type Base64 = ReturnType<typeof createBase64>;
type Base64Image = ReturnType<typeof createBase64Image>;
type PureBase64 = ReturnType<typeof createPureBase64>;
type PureBase64Image = ReturnType<typeof createPureBase64Image>;

const testString = "testString";
const testBase64 = createBase64(testString) satisfies Base64;
const testBase64Image = createBase64Image(testString) satisfies Base64Image;
const testPureBase64 = createPureBase64(testString) satisfies PureBase64;
const testPureBase64Image = createPureBase64Image(
	testBase64Image,
) satisfies PureBase64Image;

console.log("1", "[__kind]", "testBase64", ":", testBase64.__kind);
console.log("2", "[__kind]", "testBase64Image", ":", testBase64Image.__kind);
console.log("3", "[__kind]", "testPureBase64", ":", testPureBase64.__kind);
console.log(
	"4",
	"[__kind]",
	"testPureBase64Image",
	":",
	testPureBase64Image.__kind,
);

const createAge = (v: number) => extendKindTuple(v, "age");
const testAge = createAge(10);
const tenYearsLater = testAge + 10;
const cloneAge = testAge;
console.log("1", "[value]", "testAge", ":", testAge);
console.log("2", "[type]", "testAge", ":", typeof testAge);
console.log("3", "[__kind]", "testAge", ":", testAge.__kind);
console.log("4", "[calc]", "testAge + 10", ":", testAge + 1);
console.log("5", "[calc]", "tenYearsLater", ":", tenYearsLater);
console.log("6", "[__kind]", "tenYearsLater", ":", tenYearsLater.__kind);
console.log("7", "[value]", "cloneAge", ":", cloneAge);
console.log("8", "[__kind]", "cloneAge", ":", cloneAge.__kind);

interface Person {
	name: string;
	age: number;
}

const createPerson = (v: Person) => extendKindTuple(v, "person");
const preson = { name: "test", age: 10 };
const testPerson = createPerson(preson);
console.log("1", "[value]", "testPerson", ":", testPerson);
console.log("2", "[type]", "testTest", ":", typeof testPerson);
console.log("3", "[__kind]", "testTest", ":", testPerson.__kind);

// biome-ignore format:
const arrayMonth = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

const createMonth = (v: string[]) => extendKindTuple(v, "month");
const testMonth = createMonth(arrayMonth);
console.log("1", "[value]", "testMonth", ":", testMonth);
console.log("2", "[type]", "testMonth", ":", typeof testMonth);
console.log("3", "[__kind]", "testMonth", ":", testMonth.__kind);

console.log(
	"1",
	"[value]",
	'hasKind(testMonth, ["month"])',
	":",
	hasKind(testMonth, ["month", "pure"]),
);
