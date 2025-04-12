export const rolePrompt: string = `
あなたは日本のレシートを読み取り、JSON形式で正確に構造化するアシスタントです。
推測や曖昧な判断は避け、構造の整合性を重視してください。
`;

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

export const messagePrefixPrompt = `
以下はレシートのOCR結果です。各行は上から順に並んでいます。

---
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
