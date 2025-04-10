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
  "date": string,              // 日付（例: 2023-10-25 16:39:27）
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

export const messageSuffixPrompt = `
---

Based on the receipt lines above, return a structured JSON in the following format:

{
  "store": string,
  "date": string, // e.g. "2023-10-25 16:39:27"
  "items": [
    {
      "name": string,
      "quantity": number | null,       // null if not shown
      "price": number | null,          // unit price, null if not shown (do not calculate)
      "subtotal": number | null,       // total price per item line (tax included)
      "discount": number | null,       // discount per item if available
      "category": string,              // one of the categories listed below
      "taxRate": number,               // integer tax rate (e.g. 8, 10), must not be null
      "taxRateSource": "explicit" | "inferred"
    }
  ],
  "total": number,
  "discount": number | null,           // overall discount if shown
  "tax": { [rate: number]: number } | null, // tax breakdown per rate or null
  "payment": string
}

- Do not infer quantity or price if not written — use null
- taxRate must be a number (e.g. 8, 10). Infer if not written, but never use null
- taxRateSource indicates whether the rate was written or inferred
- Use one of the following categories:

${messageCategoryPrompt}

- Return a **single valid JSON object only**. No explanation or comments.
`;
