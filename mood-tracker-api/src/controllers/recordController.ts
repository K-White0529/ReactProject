import { Request, Response } from 'express';
import { RecordModel } from '../models/Record';
import { RecordInput } from '../types';

/**
 * ユーザーの記録一覧を取得
 */
export async function getRecords(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 100;
    const records = await RecordModel.findByUserId(userId, limit);

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('記録取得エラー:', error);
    res.status(500).json({
      success: false,
      message: '記録の取得に失敗しました'
    });
  }
}

/**
 * 特定の記録を取得
 */
export async function getRecordById(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const recordId = parseInt(req.params.id);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
      return;
    }

    const record = await RecordModel.findById(recordId, userId);

    if (!record) {
      res.status(404).json({
        success: false,
        message: '記録が見つかりませんでした'
      });
      return;
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('記録取得エラー:', error);
    res.status(500).json({
      success: false,
      message: '記録の取得に失敗しました'
    });
  }
}

/**
 * 新しい記録を作成
 */
export async function createRecord(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
      return;
    }

    const recordData: RecordInput = req.body;
    const record = await RecordModel.create(userId, recordData);

    res.status(201).json({
      success: true,
      data: record,
      message: '記録を作成しました'
    });
  } catch (error) {
    console.error('記録作成エラー:', error);
    res.status(500).json({
      success: false,
      message: '記録の作成に失敗しました'
    });
  }
}

/**
 * 記録を更新
 */
export async function updateRecord(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const recordId = parseInt(req.params.id);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
      return;
    }

    const recordData: RecordInput = req.body;
    const record = await RecordModel.update(recordId, userId, recordData);

    if (!record) {
      res.status(404).json({
        success: false,
        message: '記録が見つかりませんでした'
      });
      return;
    }

    res.json({
      success: true,
      data: record,
      message: '記録を更新しました'
    });
  } catch (error) {
    console.error('記録更新エラー:', error);
    res.status(500).json({
      success: false,
      message: '記録の更新に失敗しました'
    });
  }
}

/**
 * 記録を削除
 */
export async function deleteRecord(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const recordId = parseInt(req.params.id);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
      return;
    }

    const deleted = await RecordModel.delete(recordId, userId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: '記録が見つかりませんでした'
      });
      return;
    }

    res.json({
      success: true,
      message: '記録を削除しました'
    });
  } catch (error) {
    console.error('記録削除エラー:', error);
    res.status(500).json({
      success: false,
      message: '記録の削除に失敗しました'
    });
  }
}

/**
 * 統計情報を取得
 */
export async function getRecordStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
      return;
    }

    const stats = await RecordModel.getStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('統計情報取得エラー:', error);
    res.status(500).json({
      success: false,
      message: '統計情報の取得に失敗しました'
    });
  }
}