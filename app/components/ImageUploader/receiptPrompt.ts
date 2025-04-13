export const rolePrompt = `
あなたは日本のレシートを構造化するアシスタントです。
以下のルールに従い、"parse_receipt_data" 関数の引数となるJSONを生成してください。

- store: 店舗名
- date: レシートの日付。UTC形式 "YYYY-MM-DDTHH:mm:ssZ" で出力（値はJSTのままでOK）
- items: 商品の一覧。各項目は以下のとおり：
  - name: 商品名
  - quantity: 数量（"2個", "2×99円" など明記されていれば数値。なければ null）
  - price: 単価。明記されていなければ null。subtotalやquantityから計算しないこと
  - subtotal: 小計。レシート記載のまま
  - discount: 商品ごとの割引。なければ null
  - category: 商品名から分類。不明確な場合は "other"
  - taxRate: 税率（例: 8, 10）
  - taxRateSource: "explicit" は明記あり、"inferred" は推測
- total: 合計金額（税込）
- discount: 全体の割引。なければ null
- tax: {"8": 120, "10": 380} の形式。明記なければ null
- payment: 複数ある場合、金額が最も大きい支払い手段を1つだけ記載

この構造とルールに厳密に従った JSON を生成してください。
`;

export const messagePrefixPrompt = `
以下はレシートのOCR結果です。各行は上から順に並んでいます。

---
`;

export const receiptFunctionCallingSchema = {
	type: "function",
	function: {
		name: "parse_receipt_data",
		description: "日本のレシートを構造化し、会計情報をJSON形式で出力する",
		strict: true,
		parameters: {
			type: "object" as const,
			additionalProperties: false,
			properties: {
				store: {
					type: "string",
					description: "店舗名",
				},
				date: {
					type: "string",
					description:
						"UTC形式 'YYYY-MM-DDTHH:mm:ssZ' の文字列。ただし値はJSTのままで可（例: '2023-10-25T16:39:27Z'）",
				},
				items: {
					type: "array",
					description: "レシートの商品明細リスト（1件以上必須）",
					items: {
						type: "object",
						additionalProperties: false,
						properties: {
							name: {
								type: "string",
								description: "商品名",
							},
							quantity: {
								anyOf: [{ type: "number" }, { type: "null" }],
								description:
									"数量（例: '2個', '2×99円' のように明記されている場合のみ数値。なければ null）",
							},
							price: {
								anyOf: [{ type: "number" }, { type: "null" }],
								description:
									"単価（明記されていなければ null。subtotal や quantity から計算しない）",
							},
							subtotal: {
								anyOf: [{ type: "number" }, { type: "null" }],
								description:
									"小計（price × quantity ではなく、レシート上に記載された値）",
							},
							discount: {
								anyOf: [{ type: "number" }, { type: "null" }],
								description: "商品単位の割引（明記されていなければ null）",
							},
							category: {
								type: "string",
								enum: [
									"food",
									"drink",
									"snacks",
									"daily",
									"medical",
									"beauty_products",
									"clothing",
									"eating_out",
									"pet",
									"leisure",
									"transport",
									"utility",
									"other",
								],
								description:
									'商品名から明確に分類できる場合のみ指定。それ以外は "other" を使用',
							},
							taxRate: {
								type: "number",
								description: "税率（整数、null は不可。例: 8, 10）",
							},
							taxRateSource: {
								type: "string",
								enum: ["explicit", "inferred"],
								description:
									'"explicit" は税率が明記されている場合、"inferred" は推測された場合',
							},
						},
						required: [
							"name",
							"quantity",
							"price",
							"subtotal",
							"discount",
							"category",
							"taxRate",
							"taxRateSource",
						],
					},
				},

				total: {
					type: "number",
					description: "合計金額（税込）",
				},
				discount: {
					anyOf: [{ type: "number" }, { type: "null" }],
					description: "全体の割引（明記されていなければ null）",
				},
				tax: {
					anyOf: [
						{
							type: "object",
							additionalProperties: { type: "number" },
						},
						{ type: "null" },
					],
					description:
						'税率ごとの税額（例: { "8": 120, "10": 380 }）。明記されていなければ null',
				},
				payment: {
					type: "string",
					description:
						"支払い手段（複数ある場合は最も金額が大きいもの1つだけ）",
				},
			},
			required: [
				"store",
				"date",
				"items",
				"total",
				"discount",
				"tax",
				"payment",
			],
		},
	},
};

// [OLD] メッセージのプロンプト
export const messageCategoryPrompt = `
  - food: 食品
  - drink: 飲料
  - snacks: 菓子類
  - daily: 日用品
  - medical: 医薬品・衛生用品
  - beauty_products: 美容・コスメ
  - clothing: 衣料品
  - eating_out: 外食・軽食
  - pet: ペット関連
  - leisure: 娯楽・サービス
  - transport: 交通
  - utility: 公共料金
  - other: その他
`;

export const messageSuffixPromptJA = `
---

この情報をもとに、レシートの内容を以下の形式で JSON に構造化してください：

{
  "store": string,
  "date": YYYY-MM-DDTHH:mm:ssZ,
  "items": [
    {
      "name": string,
      "quantity": number | null,
      "price": number | null,
      "subtotal": number | null,
      "discount": number | null,
      "category": string,
      "taxRate": number,
      "taxRateSource": "explicit" | "inferred"
    }
  ],
  "total": number,
  "discount": number | null,
  "tax": { "8": number, "10": number, ... } | null,
  "payment": string
}

- "date" は "YYYY-MM-DDTHH:mm:ssZ" の UTC 形式で出力してください（例: 2023-10-25T16:39:27Z）。"Z" は付けてくださいが、値は日本時間のままで構いません。
- 数量は「2個」「2×99円」などの記載があれば quantity に数値を記載してください。明記されていなければ null にしてください。
- price（単価）は明記されていない限り null にし、subtotal や quantity から計算しないでください。
- 割引（discount）は商品ごと・全体いずれも、明記されていなければ null にしてください。
- category は以下から明確に判断できる場合のみ記載し、不明確な場合は "other" を使用してください。
${messageCategoryPrompt}
- taxRate は必ず整数（例: 8, 10）で、null は禁止です。
- taxRateSource は taxRate が記載されていれば "explicit"、推測した場合は "inferred" としてください。
- tax フィールドは税率ごとの合計税額を記載してください（例: { "8": 120, "10": 380 }）。明記されていなければ null。
- payment が複数ある場合は、最も金額が大きい手段を選んで1つだけ記載してください（例: majica+クレジット → クレジット）。

出力は **上記形式に厳密に準拠した JSON オブジェクトのみ** にしてください。コメントや補足は一切不要です。
`;

export const messageSuffixPromptEN = `
---

Based on the OCR result above, return a structured JSON with the following format:

{
  "store": string,
  "date": YYYY-MM-DDTHH:mm:ssZ,
  "items": [
    {
      "name": string,
      "quantity": number | null,
      "price": number | null,
      "subtotal": number | null,
      "discount": number | null,
      "category": string,
      "taxRate": number,
      "taxRateSource": "explicit" | "inferred"
    }
  ],
  "total": number,
  "discount": number | null,
  "tax": { "8": number, "10": number, ... } | null,
  "payment": string
}

- "date" must be in UTC format "YYYY-MM-DDTHH:mm:ssZ". Use "Z" literally, but the value should reflect the original **Japanese time** as written on the receipt.
- If quantity is shown as "2個", "2×99", etc., set quantity to 2. Otherwise, set it to null.
- price must be null unless explicitly stated. Do not calculate it from subtotal and quantity.
- discount must be null unless explicitly shown for the item or overall receipt.
- category must be chosen from the list below only if it is clearly identifiable from the item name. Otherwise, set it to "other".
${messageCategoryPrompt}
- taxRate must be a number (e.g., 8, 10), and must not be null.
- taxRateSource must be "explicit" if written on the receipt, or "inferred" if deduced from context.
- tax should be a map of tax rates to their total amounts (e.g., { "8": 120, "10": 380 }). If not shown, use null.
- If multiple payment methods are used, choose only the one with the highest amount.

**Only return a single valid JSON object with no explanations or comments.**
`;
