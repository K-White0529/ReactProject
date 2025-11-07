import { Request, Response } from 'express';
import { AnalysisModel } from '../models/Analysis';

/**
 * 分析観点一覧を取得
 */
export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const categories = await AnalysisModel.getAllCategories();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('観点取得エラー:', error);
    res.status(500).json({
      success: false,
      message: '観点の取得に失敗しました'
    });
  }
}

/**
 * 有効な質問一覧を取得
 */
export async function getQuestions(req: Request, res: Response): Promise<void> {
  try {
    const questions = await AnalysisModel.getActiveQuestions();

    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('質問取得エラー:', error);
    res.status(500).json({
      success: false,
      message: '質問の取得に失敗しました'
    });
  }
}

/**
 * 回答を保存
 */
export async function saveAnswers(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
      return;
    }

    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({
        success: false,
        message: '回答データが必要です'
      });
      return;
    }

    await AnalysisModel.saveAnswers(userId, answers);

    res.status(201).json({
      success: true,
      message: '回答を保存しました'
    });
  } catch (error) {
    console.error('回答保存エラー:', error);
    res.status(500).json({
      success: false,
      message: '回答の保存に失敗しました'
    });
  }
}