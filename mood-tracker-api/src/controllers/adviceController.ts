import { Request, Response } from "express";
import { generateSimpleAdvice, generatePersonalizedAdvice } from "../services/aiService";
import { AdviceModel } from "../models/Advice";
import { RecordModel } from "../models/Record";
import { getCurrentWeather } from "../services/weatherService";
import { AnalysisModel } from "../models/Analysis";
import { analyzeData } from "../services/aiService";

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

/**
 * パーソナライズドアドバイスを生成
 */
export async function getPersonalizedAdvice(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const userId = req.user?.userId;
        const userName = req.user?.username || "ユーザー";

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "認証が必要です",
            });
            return;
        }

        // 最新の記録を取得
        const latestRecords = await RecordModel.findByUserId(userId, 1);
        const latestRecord = latestRecords.length > 0 ? latestRecords[0] : null;

        // 直近の記録を取得（7日分）
        const recentRecords = await RecordModel.findByUserId(userId, 7);

        // 現在の天気を取得
        const currentWeather = await getCurrentWeather('Tokyo');

        // オプション：AI分析結果を取得（あれば）
        let analysisResult = null;
        if (recentRecords.length >= 3) {
            try {
                const analysisData = await AnalysisModel.getAnalysisData(userId, 7);
                if (analysisData.records.length > 0) {
                    analysisResult = await analyzeData(analysisData);
                }
            } catch (error) {
                console.log('分析結果の取得に失敗（無視して続行）:', error);
            }
        }

        // パーソナライズドアドバイスを生成
        const advice = await generatePersonalizedAdvice({
            userName,
            latestRecord,
            recentRecords,
            currentWeather,
            analysisResult,
        });

        // アドバイスをデータベースに保存
        await AdviceModel.create(userId, advice, 'personalized');

        res.json({
            success: true,
            data: {
                advice: advice,
                generated_at: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("パーソナライズドアドバイス生成エラー:", error);
        res.status(500).json({
            success: false,
            message: "アドバイスの生成に失敗しました",
        });
    }
}

/**
 * アドバイス履歴を取得
 */
export async function getAdviceHistory(
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

        const limit = parseInt(req.query.limit as string) || 10;
        const history = await AdviceModel.getHistory(userId, limit);

        res.json({
            success: true,
            data: history,
        });
    } catch (error) {
        console.error("アドバイス履歴取得エラー:", error);
        res.status(500).json({
            success: false,
            message: "アドバイス履歴の取得に失敗しました",
        });
    }
}
