/**
 * FileオブジェクトからBase64文字列を取得する
 *
 * @param file - ユーザーが選択した画像ファイル
 * @returns Base64文字列（`data:image/*;base64,...` 形式）
 */
export const convertToBase64 = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = (error) => reject(error);
	});
};

/**
 * 文字列が Data URL（data:image/...;base64,...）形式か判定する
 *
 * @param str - 判定対象の文字列
 * @returns boolean
 */
export const isBase64DataUrl = (str: string): boolean => {
	return /^data:image\/[a-zA-Z]+;base64,/.test(str);
};

/**
 * Base64 Data URL 形式の文字列からプレフィックスを除去する
 * （data:image/png;base64,... → iVBORw0...）
 *
 * @param dataUrl - Base64 Data URL形式の文字列
 * @returns プレフィックスを除いた純粋なBase64文字列
 */
export const stripBase64Prefix = (dataUrl: string): string => {
	return dataUrl.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
};
