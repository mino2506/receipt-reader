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
  "store": string,             // 店舗名
  "date": YYYY-MM-DDTHH:mm:ssZ,              // 日付（例: 2023-10-25T16:39:27Z 必ず絶対にUTC表記形式）
  "items": [
    {
      "name": string,               // 商品名
      "quantity": number | null,    // 数量（明記されていなければ null。クライアント側で 1 に補完）
      "price": number | null,       // 単価（明記されていなければ null。GPTで計算しない）
      "subtotal": number | null,    // 小計（税込） 明記されていなければ null
      "discount": number | null,    // 値引き額（明記されていなければ null）
      "category": string,           // 商品カテゴリ（下記リストから選択）
      "taxRate": number,            // 税率（整数、例: 8, 10 など）文脈から推論可。nullは禁止
      "taxRateSource": "explicit" | "inferred" // 税率の出所。明記されていれば "explicit"、なければ "inferred"
    }
  ],
  "total": number,             // 合計（税込）
  "discount": number | null,   // レシート全体の値引き額（明記されていなければ null）
  "tax": { [rate: number]: number } | null, // 各税率ごとの税額。明記なければ null
  "payment": string            // 支払方法（例: 現金, クレジット, QUICPay）
}

- date は 必ず絶対にUTC表記形式 "YYYY-MM-DDTHH:mm:ssZ" 形式で出力してください。例："2023-10-25T16:39:27Z"
- 日付はスペースで区切らないで、"T" で区切る！
- 秒の後に必ずZを付けること
- この "Z" は UTC を意味しますが、実際の時刻は **レシートに書かれている日本時間（JST）そのまま**で構いません。
- GPT側でタイムゾーンを考慮して補正する必要はありません。
- 時刻が書かれていない場合は "T00:00:00Z" を補完してください。
- quantity は明記されていなければ null としてください。GPTが勝手に 1 と推測しないでください（クライアント側で補完します）
- price（単価）は subtotal や quantity が揃っていても GPTでは計算せず null にしてください
- 割引（discount）は商品行またはレシート全体に明記されていれば金額を記載し、なければ null にしてください
- 税率（taxRate）は null を使用せず、整数（例: 8, 10, 将来は 12 など）で記載してください
- taxRateSource は "explicit"（レシートに明記あり）または "inferred"（文脈からの推定）で必ず出力してください
- tax フィールドは各税率ごとの税額合計を記載してください。明記されていなければ tax: null としてください
- 商品カテゴリ（category）は以下から1つ選んでください（id: 日本語）：
${messageCategoryPrompt}

- 出力は上記形式に完全に準拠した JSON オブジェクト1つのみで、余計な説明やコメントは含めないでください
`;

export const messageSuffixPromptEN = `
---

Based on the provided information, structure the receipt content into the following JSON format:

{
  "store": string,             // Store name
  "date": YYYY-MM-DDTHH:mm:ssZ, // Date (example: 2023-10-25T16:39:27Z; must be in strict UTC format)
  "items": [
    {
      "name": string,               // Item name
      "quantity": number | null,    // Quantity (null if not explicitly written; client will default to 1)
      "price": number | null,       // Unit price (null if not written; do NOT calculate from subtotal/quantity)
      "subtotal": number | null,    // Subtotal (tax-included); null if not written
      "discount": number | null,    // Discount amount; null if not written
      "category": string,           // Item category (must be selected from the list below)
      "taxRate": number,            // Tax rate as an integer (e.g., 8, 10); must NOT be null
      "taxRateSource": "explicit" | "inferred" // Source of tax rate; must be either "explicit" or "inferred"
    }
  ],
  "total": number,             // Total amount (tax included)
  "discount": number | null,   // Total receipt-level discount; null if not written
  "tax": { [rate: number]: number } | null, // Tax amount per rate; null if not written
  "payment": string            // Payment method (e.g., cash, credit, QUICPay)
}

- The "date" field must strictly follow the UTC ISO 8601 format: "YYYY-MM-DDTHH:mm:ssZ".
  - Example: "2023-10-25T16:39:27Z"
  - DO NOT use a space separator; always use "T" between date and time.
  - The "Z" must be present and placed right after the seconds.
  - Although "Z" denotes UTC, you must treat the value as **local time in Japan (JST)** as written on the receipt.
  - Do NOT convert the time to UTC — just use the local time with "Z" for format compliance.
  - If time is missing, output "T00:00:00Z" as default.

- Set "quantity" to null if it's not explicitly mentioned. DO NOT assume it as 1.
- Set "price" to null even if subtotal and quantity are both present. DO NOT calculate it.
- For "discount", include the amount only if explicitly written, otherwise null.
- "taxRate" must be an integer (e.g., 8, 10, or 12) — null is NOT allowed.
- "taxRateSource" must always be either "explicit" (clearly written) or "inferred" (inferred from context).
- "tax" must be a mapping of tax rate (as integer) to tax amount; null if not written.
- "category" must be one of the following options (id: label in Japanese):
${messageCategoryPrompt}

- Output must be a single, valid JSON object **only**, with no extra text, commentary, or formatting.
`;
