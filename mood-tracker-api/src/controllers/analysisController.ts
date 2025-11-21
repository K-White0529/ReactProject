import { Request, Response } from 'express';
import { AnalysisModel } from '../models/Analysis';
import { generateAnalysisQuestions } from '../services/aiService';

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

/**
 * AIで質問を生成してデータベースに保存（テスト用）
 */
export async function generateQuestions(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
      return;
    }

    // クエリパラメータからカテゴリIDと生成数を取得
    const categoryId = parseInt(req.query.categoryId as string);
    const count = parseInt(req.query.count as string) || 3;

    if (!categoryId || isNaN(categoryId)) {
      res.status(400).json({
        success: false,
        message: 'カテゴリIDが必要です'
      });
      return;
    }

    // カテゴリ情報を取得
    const categories = await AnalysisModel.getAllCategories();
    const category = categories.find(c => c.id === categoryId);

    if (!category) {
      res.status(404).json({
        success: false,
        message: '指定されたカテゴリが見つかりません'
      });
      return;
    }

    // そのカテゴリの既存質問を取得
    const allQuestions = await AnalysisModel.getActiveQuestions();
    const existingQuestions = allQuestions
      .filter(q => q.category_id === categoryId)
      .map(q => q.question_text);

    // AIで質問を生成
    const newQuestions = await generateAnalysisQuestions(
      category.name,
      category.description || '',
      existingQuestions,
      count
    );

    // データベースに保存
    const savedQuestions = await AnalysisModel.saveGeneratedQuestions(
      categoryId,
      newQuestions
    );

    res.status(201).json({
      success: true,
      data: {
        category: category.name,
        generated_count: newQuestions.length,
        questions: savedQuestions
      },
      message: `${newQuestions.length}個の質問を生成しました`
    });
  } catch (error) {
    console.error('質問生成エラー:', error);
    res.status(500).json({
      success: false,
      message: '質問の生成に失敗しました'
    });
  }
}

/**
 * 観点別の平均スコアを取得
 */
export async function getCategoryScores(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
      return;
    }

    // クエリパラメータから期間を取得
    const period = req.query.period as string || 'today';

    // 期間に応じた日付範囲を計算
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
      case 'today':
        startDate = new Date(endDate);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '3days':
        startDate.setDate(endDate.getDate() - 2);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '1week':
        startDate.setDate(endDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '3weeks':
        startDate.setDate(endDate.getDate() - 20);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate = new Date(endDate);
        startDate.setHours(0, 0, 0, 0);
    }

    const scores = await AnalysisModel.getCategoryAverageScores(userId, startDate, endDate);

    res.json({
      success: true,
      data: {
        period,
        start_date: startDate,
        end_date: endDate,
        scores
      }
    });
  } catch (error) {
    console.error('観点別スコア取得エラー:', error);
    res.status(500).json({
      success: false,
      message: '観点別スコアの取得に失敗しました'
    });
  }
}

/**
 * 観点別のスコア遷移を取得
 */
export async function getCategoryTrends(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
      return;
    }

    // クエリパラメータから期間を取得
    const period = req.query.period as string || '1week';

    // 期間に応じた日付範囲を計算
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
      case 'today':
        startDate = new Date(endDate);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '3days':
        startDate.setDate(endDate.getDate() - 2);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '1week':
        startDate.setDate(endDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '3weeks':
        startDate.setDate(endDate.getDate() - 20);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate.setDate(endDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
    }

    const trends = await AnalysisModel.getCategoryScoreTrends(userId, startDate, endDate);

    res.json({
      success: true,
      data: {
        period,
        start_date: startDate,
        end_date: endDate,
        trends
      }
    });
  } catch (error) {
    console.error('スコア遷移取得エラー:', error);
    res.status(500).json({
      success: false,
      message: 'スコア遷移の取得に失敗しました'
    });
  }
}

/**
 * ランダムな質問を取得（記録入力用）
 */
export async function getRandomQuestions(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
      return;
    }

    const questionsPerCategory = parseInt(req.query.perCategory as string) || 5;

    const questions = await AnalysisModel.getRandomQuestionsByCategory(questionsPerCategory);

    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('ランダム質問取得エラー:', error);
    res.status(500).json({
      success: false,
      message: 'ランダム質問の取得に失敗しました'
    });
  }
}