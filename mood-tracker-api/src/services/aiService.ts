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
 * ユーザーの記録データをAIで分析
 */
export async function analyzeData(data: {
    period: {
        startDate: string;
        endDate: string;
        days: number;
    };
    records: any[];
    weather: any[];
    analysis: any[];
}): Promise<any> {
    try {
        // データが空の場合は分析できない
        if (data.records.length === 0) {
            return {
                error: "分析するデータがありません。記録を追加してください。",
            };
        }

        // 統計情報の計算
        const emotionScores = data.records
            .filter((r) => r.emotion_score !== null)
            .map((r) => r.emotion_score);
        const motivationScores = data.records
            .filter((r) => r.motivation_score !== null)
            .map((r) => r.motivation_score);
        const sleepHours = data.records
            .filter((r) => r.sleep_hours !== null)
            .map((r) => r.sleep_hours);
        const exerciseMinutes = data.records
            .filter((r) => r.exercise_minutes !== null)
            .map((r) => r.exercise_minutes);

        const avgEmotion =
            emotionScores.length > 0
                ? (emotionScores.reduce((a, b) => a + b, 0) / emotionScores.length).toFixed(1)
                : null;
        const avgMotivation =
            motivationScores.length > 0
                ? (motivationScores.reduce((a, b) => a + b, 0) / motivationScores.length).toFixed(1)
                : null;
        const avgSleep =
            sleepHours.length > 0
                ? (sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length).toFixed(1)
                : null;
        const totalExercise =
            exerciseMinutes.length > 0
                ? exerciseMinutes.reduce((a, b) => a + b, 0)
                : 0;

        // 気象データの平均
        const avgTemp =
            data.weather.length > 0
                ? (data.weather.reduce((a, b) => a + b.temperature, 0) / data.weather.length).toFixed(1)
                : null;
        const avgHumidity =
            data.weather.length > 0
                ? (data.weather.reduce((a, b) => a + b.humidity, 0) / data.weather.length).toFixed(1)
                : null;

        // AI分析用のプロンプト作成
        const prompt = `
あなたはウェルネスと健康管理の専門家です。
以下のユーザーデータを分析し、洞察と推奨事項を提供してください。

**分析期間**: ${data.period.days}日間 (${new Date(data.period.startDate).toLocaleDateString('ja-JP')} 〜 ${new Date(data.period.endDate).toLocaleDateString('ja-JP')})
**記録数**: ${data.records.length}件

**基本統計**:
- 平均気分スコア: ${avgEmotion !== null ? avgEmotion + '/10' : 'データなし'}
- 平均モチベーションスコア: ${avgMotivation !== null ? avgMotivation + '/10' : 'データなし'}
- 平均睡眠時間: ${avgSleep !== null ? avgSleep + '時間' : 'データなし'}
- 総運動時間: ${totalExercise}分

**気象データ** (平均):
- 気温: ${avgTemp !== null ? avgTemp + '°C' : 'データなし'}
- 湿度: ${avgHumidity !== null ? avgHumidity + '%' : 'データなし'}

**分析回答データ**:
${data.analysis.map(a => `- ${a.category_name}: ${a.avg_score !== null ? a.avg_score + '/10' : 'データなし'} (${a.answer_count}回答)`).join('\n')}

**要件**:
1. データの傾向を分析してください
2. 気象条件と気分・モチベーションの相関関係を考察してください
3. 睡眠、運動、食事が気分に与える影響を考察してください
4. 具体的で実践可能な推奨事項を3〜5個提供してください
5. ポジティブで支援的なトーンを使ってください

**重要**: 以下のJSON形式で回答し、**JSON以外のテキストを含めないでください**。マークダウンのコードブロック(\`\`\`json)も使わないでください。

{
  "summary": "全体的な状態の要約（100文字程度）",
  "trends": {
    "emotion": {
      "trend": "improving | stable | declining",
      "description": "気分の傾向に関する説明"
    },
    "motivation": {
      "trend": "improving | stable | declining",
      "description": "モチベーションの傾向に関する説明"
    }
  },
  "correlations": [
    "相関関係の考察1（例: 気温と気分の関係）",
    "相関関係の考察2（例: 睡眠とモチベーションの関係）"
  ],
  "recommendations": [
    "具体的な推奨事項1",
    "具体的な推奨事項2",
    "具体的な推奨事項3"
  ]
}
`;

        // AIに分析を依頼
        console.log('AI分析プロンプト送信...');
        const response = await generateText(prompt);
        console.log('AI分析レスポンス受信:', response.substring(0, 200));

        // JSONパース（マークダウンコードブロックを除去）
        let jsonText = response.trim();
        jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");

        console.log('JSONパース前のテキスト:', jsonText.substring(0, 200));

        const analysisResult = JSON.parse(jsonText);
        console.log('AI分析成功:', analysisResult);

        return analysisResult;
    } catch (error) {
        console.error("AI分析エラー（詳細）:", error);
        if (error instanceof Error) {
            console.error("エラーメッセージ:", error.message);
            console.error("エラースタック:", error.stack);
        }
        throw error;
    }
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
