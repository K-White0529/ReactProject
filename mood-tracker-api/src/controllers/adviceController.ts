import { Request, Response } from "express";
import { generateSimpleAdvice } from "../services/aiService";

/**
 * シンプルなアドバイスを生成（テスト用）
 */
export async function getSimpleAdvice(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "認証が必要です",
            });
            return;
        }

        // ユーザー名を取得（簡易実装）
        const userName = req.user?.username || "ユーザー";

        // AIアドバイス生成
        const advice = await generateSimpleAdvice(userName);

        res.json({
            success: true,
            data: {
                advice: advice,
                generated_at: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("アドバイス生成エラー:", error);
        res.status(500).json({
            success: false,
            message: "アドバイスの生成に失敗しました",
        });
    }
}
