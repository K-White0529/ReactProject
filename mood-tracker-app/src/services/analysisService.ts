import api from './api';
import type { ApiResponse } from '../types';

// 分析観点の型
export interface AnalysisCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
}

// 質問の型
export interface AnalysisQuestion {
  id: number;
  category_id: number;
  question_text: string;
  is_active: boolean;
  generated_by_ai: boolean;
  usage_count: number;
  category_name?: string;
  category_code?: string;
}

// 回答の型
export interface AnalysisAnswer {
  id?: number;
  user_id?: number;
  record_id?: number;
  question_id: number;
  answer_score: number;
  answered_at?: string;
}

// 回答入力用の型
export interface AnalysisAnswerInput {
  record_id?: number;
  question_id: number;
  answer_score: number;
}

/**
 * すべての分析観点を取得
 */
export async function getAnalysisCategories(): Promise<AnalysisCategory[]> {
  const response = await api.get<ApiResponse<AnalysisCategory[]>>('/api/analysis/categories');

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  return [];
}

/**
 * 有効な質問を取得
 */
export async function getActiveQuestions(): Promise<AnalysisQuestion[]> {
  const response = await api.get<ApiResponse<AnalysisQuestion[]>>('/api/analysis/questions');

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  return [];
}

/**
 * 回答を保存
 */
export async function saveAnswers(answers: AnalysisAnswerInput[]): Promise<void> {
  const response = await api.post<ApiResponse>('/api/analysis/answers', { answers });

  if (!response.data.success) {
    throw new Error(response.data.message || '回答の保存に失敗しました');
  }
}