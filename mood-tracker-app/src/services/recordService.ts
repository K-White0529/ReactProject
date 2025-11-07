import api from './api';
import type { Record, RecordInput, RecordStats, ApiResponse } from '../types';

/**
 * 記録一覧を取得
 */
export async function getRecords(limit = 100): Promise<Record[]> {
  const response = await api.get<ApiResponse<Record[]>>(`/api/records?limit=${limit}`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  return [];
}

/**
 * 特定の記録を取得
 */
export async function getRecordById(id: number): Promise<Record> {
  const response = await api.get<ApiResponse<Record>>(`/api/records/${id}`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || '記録の取得に失敗しました');
}

/**
 * 新しい記録を作成
 */
export async function createRecord(recordData: RecordInput): Promise<Record> {
  const response = await api.post<ApiResponse<Record>>('/api/records', recordData);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || '記録の作成に失敗しました');
}

/**
 * 記録を更新
 */
export async function updateRecord(id: number, recordData: RecordInput): Promise<Record> {
  const response = await api.put<ApiResponse<Record>>(`/api/records/${id}`, recordData);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || '記録の更新に失敗しました');
}

/**
 * 記録を削除
 */
export async function deleteRecord(id: number): Promise<void> {
  const response = await api.delete<ApiResponse>(`/api/records/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.message || '記録の削除に失敗しました');
  }
}

export async function getRecordStats(): Promise<RecordStats> {
  const response = await api.get<ApiResponse<RecordStats>>('/api/records/stats');

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  return {
    total_records: 0,
    this_week_records: 0
  };
}