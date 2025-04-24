export const rolePrompt = `
あなたは日本のレシートを構造化するアシスタントです。
以下のルールに従い、"parse_receipt_data" 関数の引数となるJSONを生成してください。

- totalPrice: レシートに記載された税込合計金額
- date: レシートの日付（UTC形式 "YYYY-MM-DDTHH:mm:ssZ" で出力。ただし時刻はJSTのままでOK）
- store: 店舗情報オブジェクト。以下を含む
  - rawName: レシートに記載された店舗名（正式名称でなくてもよい）
- totalDiscount: 全体に適用された割引金額（なければ null）
- totalTax: 税率ごとの税額（例: { "8": 120, "10": 380 }。明記されていなければ null）
- details: 商品明細の配列。各要素には以下を含める：
  - item: 商品情報オブジェクト。以下を含む
    - rawName: レシートに記載された商品名（略称や通称でOK）
    - category: 商品カテゴリ（以下から最も適切なものを1つ指定）
      ["food", "drink", "snacks", "daily", "medical", "beauty_products", "clothing", "eating_out", "pet", "leisure", "transport", "utility", "other"]
  - amount: 商品の数量。明記されていなければ "1"
  - unitPrice: 単価。明記されていなければ null。subtotal から計算しない
  - subTotalPrice: 商品ごとの小計。レシートに記載された金額をそのまま記載
  - tax: 商品に対する税額（明記されていなければ 0 でも可）
  - discount: 商品単位の割引（なければ null）
  - currency: 通貨コード（現在は常に "JPY"）
  - taxRate: 税率（例: 8, 10）
  - taxRateSource: 税率が明記されている場合は "explicit"、推測である場合は "inferred"

この構造とルールに厳密に従った JSON を生成してください。
余計な出力や注釈は一切不要です。
`;

export const messagePrefixPrompt = `
以下はレシートのOCR結果です。各行は上から順に並んでいます。

---
`;

export const receiptFunctionCallingSchema = {
	type: "function",
	function: {
		name: "parse_receipt_data",
		description:
			"日本のレシートを構造化し、家計簿システムに登録可能な形式で出力する",
		strict: true,
		parameters: {
			type: "object" as const,
			additionalProperties: false,
			properties: {
				totalPrice: {
					type: "number",
					description: "合計金額（税込）",
				},
				date: {
					type: "string",
					description:
						"見たままのレシートの日付（ISO 8601形式: YYYY-MM-DDTHH:mm:ssZ）",
				},
				store: {
					type: "object" as const,
					additionalProperties: false,
					properties: {
						rawName: {
							type: "string",
							description: "レシートに記載された店舗名",
						},
					},
					required: ["rawName"],
				},
				totalDiscount: {
					anyOf: [{ type: "number" }, { type: "null" }],
					description: "全体の割引",
				},
				totalTax: {
					type: "object",
					additionalProperties: { type: "number" },
					properties: {},
					description: ` 
            **必須**
            - 税率ごとの税額（例: { "8": 120, "10": 380 }）。
            - 外食を除く食品は軽減税率対象
            - "軽" は軽減税率のマーカーの場合あり。
            - 下部に記載されている小計に記載されている
            - 小計に記載されている税率が
            `,
				},
				details: {
					type: "array" as const,
					additionalProperties: false,
					description: "レシートの商品明細リスト",
					items: {
						type: "object" as const,
						additionalProperties: false,
						properties: {
							item: {
								type: "object" as const,
								additionalProperties: false,
								properties: {
									rawName: {
										type: "string",
										description: "レシートに記載された商品名",
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
										description: '商品名から分類。不明な場合は "other" を使用',
									},
								},
								required: ["rawName", "category"],
							},
							amount: {
								type: "number",
								description:
									"数量（例: '2個', '2×99円' のように明記されている数値。なければ 1 ）",
							},
							unitPrice: {
								type: "number",
								description:
									"単価（明記されていなければ null。subtotal や quantity から計算しない）",
							},
							subTotalPrice: {
								type: "number",
								description:
									"小計（price × quantity ではなく、レシート上に記載された値）",
							},
							tax: {
								type: "number",
								description: "税額。税の小計から類推しても良い",
							},
							discount: {
								anyOf: [{ type: "number" }, { type: "null" }],
								description: "商品単位の割引（明記されていなければ null）",
							},
							currency: {
								type: "string",
								enum: ["JPY"],
							},
							taxRate: {
								type: "number",
								description:
									"税率（整数、null は不可。例: 8, 10）,税率毎の小計から類推しても良い",
							},
							taxRateSource: {
								type: "string",
								enum: ["explicit", "inferred"],
								description:
									'"explicit" は税率が明記されている場合、"inferred" は推測された場合',
							},
						},
						required: [
							"item",
							"amount",
							"unitPrice",
							"subTotalPrice",
							"tax",
							"discount",
							"currency",
							"taxRate",
							"taxRateSource",
						],
					},
				},
			},
			required: [
				"totalPrice",
				"store",
				"details",
				"date",
				"totalDiscount",
				"totalTax",
			],
		},
	},
};
