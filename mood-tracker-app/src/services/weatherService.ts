import api from './api';
import type { CurrentWeather, ApiResponse } from '../types';

/**
 * 現在の気象データを取得
 */
export async function getCurrentWeather(): Promise<CurrentWeather | null> {
  try {
    const response = await api.get<ApiResponse<CurrentWeather>>('/api/weather/current');

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    return null;
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
}

// TODO: 記録に紐づく天気情報を取得する関数を追加