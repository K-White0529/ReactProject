import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini APIの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// 使用するモデル（Gemini 2.5 Flash - 最新の高速モデル、無料枠で利用可能）
const MODEL_NAME = "gemini-2.5-flash";

/**
 * Gemini APIを使用してテキストを生成
 */
export async function generateText(prompt: string): Promise<string> {
    try {
        // APIキーの確認
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not configured");
        }

        // モデルの取得
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        // テキスト生成
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("AI text generation failed");
    }
}

/**
 * シンプルなアドバイス生成（テスト用）
 */
export async function generateSimpleAdvice(userName: string): Promise<string> {
    const prompt = `
あなたは親しみやすい健康アドバイザーです。
ユーザー名: ${userName}

簡潔に（3文以内で）、今日の調子を記録することの大切さと、
前向きなメッセージを伝えてください。
`;

    return await generateText(prompt);
}

/**
 * ユーザーデータに基づくアドバイス生成（今後実装予定）
 */
export async function generatePersonalizedAdvice(
    userData: any
): Promise<string> {
    // 今後実装
    throw new Error("Not implemented yet");
}

/**
 * 分析観点に基づく質問を生成
 */
export async function generateAnalysisQuestions(
    categoryName: string,
    categoryDescription: string,
    existingQuestions: string[],
    count: number = 3
): Promise<string[]> {
    const existingQuestionsText =
        existingQuestions.length > 0
            ? `\n既存の質問（重複を避けてください）:\n${existingQuestions
                  .map((q, i) => `${i + 1}. ${q}`)
                  .join("\n")}`
            : "";

    const prompt = `
あなたは心理学とウェルネスの専門家です。
以下の分析観点に関する質問を${count}個生成してください。

分析観点: ${categoryName}
説明: ${categoryDescription}
${existingQuestionsText}

要件:
1. ユーザーが自分の状態を1〜10の段階で評価できる質問にすること
2. 簡潔で分かりやすい日本語で書くこと
3. 「〜はどの程度ですか？」「〜できていますか？」などの形式が望ましい
4. 既存の質問と重複しないこと
5. 1つの質問は50文字以内にすること
6. **重要**: 質問文には分析観点名（「${categoryName}」）や関連する心理学用語を絶対に含めないこと
7. **重要**: 抽象的な状態ではなく、具体的な行動、身体的症状、日常生活の結果について質問すること
8. ユーザーが質問文を見たときに「何を測定しようとしているか」が直感的に分かりにくい質問にすること

質問設計の指針:
- 分析観点が「ストレス」の場合:
  × 悪い例: 「心身の緊張はどの程度ですか？」← 抽象的で意図が明白
  ○ 良い例: 「夜中に目が覚めることはどの程度ありますか？」← 具体的な症状
  ○ 良い例: 「些細なことでイライラすることはどの程度ありますか？」← 具体的な反応

- 分析観点が「集中力」の場合:
  × 悪い例: 「一つの作業に深く入り込めていますか？」← 意図が明白
  ○ 良い例: 「予定していた作業を予定通りに終えられましたか？」← 結果に焦点
  ○ 良い例: 「SNSやメールを気にせず過ごせた時間はどの程度ありますか？」← 具体的な行動
  ○ 良い例: 「同じことを何度も読み返す必要はどの程度ありましたか？」← 具体的な現象

- 分析観点が「モチベーション」の場合:
  × 悪い例: 「物事に積極的に取り組めていますか？」← 意図が明白
  ○ 良い例: 「朝、すぐに活動を始められましたか？」← 具体的な行動
  ○ 良い例: 「後回しにしたい気持ちになることはどの程度ありましたか？」← 具体的な感情
  ○ 良い例: 「新しいことを試してみたいと思いましたか？」← 具体的な欲求

追加のポイント:
- 日常の具体的な場面を想定する
- 観察可能な行動について質問する
- 身体的な症状や感覚について質問する
- 質問が複数の観点に関連する可能性があっても構わない（測定する観点は事前に決まっている）

回答形式:
質問は以下の形式で、1行に1つずつ出力してください。番号や記号は不要です。
（質問文のみを改行区切りで出力）
`;

    try {
        const response = await generateText(prompt);

        // レスポンスを行ごとに分割し、空行を除去
        const questions = response
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0 && line.length <= 100) // 空行と長すぎる行を除外
            .slice(0, count); // 指定された数だけ取得

        return questions;
    } catch (error) {
        console.error("質問生成エラー:", error);
        throw new Error("Failed to generate questions");
    }
}