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

/**
 * 記録IDに紐づく気象データを取得
 */
export async function getWeatherByRecordId(recordId: number): Promise<CurrentWeather | null> {
  try {
    const response = await api.get<ApiResponse<CurrentWeather>>(`/api/weather/record/${recordId}`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    return null;
  } catch (error) {
    console.error('Weather fetch by record error:', error);
    return null;
  }
}