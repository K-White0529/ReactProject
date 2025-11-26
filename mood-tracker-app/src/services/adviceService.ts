import api from './api';
import type { ApiResponse } from '../types';

export interface Advice {
  id: number;
  user_id: number;
  advice_text: string;
  advice_type: string;
  created_at: string;
}

export interface AdviceData {
  advice: string;
  generated_at: string;
}

/**
 * パーソナライズされたアドバイスを生成
 */
export async function generatePersonalizedAdvice(): Promise<AdviceData> {
  const response = await api.get<ApiResponse<AdviceData>>('/api/advice/personalized');
  
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'アドバイスの生成に失敗しました');
}

/**
 * アドバイス履歴を取得
 */
export async function getAdviceHistory(limit: number = 10): Promise<Advice[]> {
  const response = await api.get<ApiResponse<Advice[]>>(`/api/advice/history?limit=${limit}`);
  
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'アドバイス履歴の取得に失敗しました');
}

/**
 * 最新のアドバイスを取得
 */
export async function getLatestAdvice(): Promise<Advice | null> {
  try {
    const history = await getAdviceHistory(1);
    return history.length > 0 ? history[0] : null;
  } catch (error) {
    console.error('最新アドバイス取得エラー:', error);
    return null;
  }
}
