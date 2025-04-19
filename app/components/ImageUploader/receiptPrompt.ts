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
					anyOf: [
						{
							type: "object",
							additionalProperties: { type: "number" },
						},
						{ type: "null" },
					],
					description: '税率ごとの税額（例: { "8": 120, "10": 380 }）。',
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
