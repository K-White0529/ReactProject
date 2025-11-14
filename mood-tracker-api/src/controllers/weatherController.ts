import { Request, Response } from 'express';
import { getCurrentWeather } from '../services/weatherService';
import { WeatherDataModel } from '../models/WeatherData';

/**
 * 現在の気象データを取得
 */
export async function getCurrentWeatherData(req: Request, res: Response): Promise<void> {
  try {
    const city = req.query.city as string || 'Tokyo';

    const weatherData = await getCurrentWeather(city);

    if (!weatherData) {
      res.status(500).json({
        success: false,
        message: '気象データの取得に失敗しました'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        weatherCondition: weatherData.weatherCondition,
        location: weatherData.location
      }
    });
  } catch (error) {
    console.error('Weather data error:', error);
    res.status(500).json({
      success: false,
      message: '気象データの取得に失敗しました'
    });
  }
}

/**
 * 記録IDに紐づく気象データを取得
 */
export async function getWeatherByRecordId(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const recordId = parseInt(req.params.recordId);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
      return;
    }

    if (isNaN(recordId)) {
      res.status(400).json({
        success: false,
        message: '無効な記録IDです'
      });
      return;
    }

    const weatherData = await WeatherDataModel.getByRecordId(recordId, userId);

    if (!weatherData) {
      res.status(404).json({
        success: false,
        message: '気象データが見つかりませんでした'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        weatherCondition: weatherData.weather_condition,
        location: weatherData.location,
        recordedAt: weatherData.recorded_at
      }
    });
  } catch (error) {
    console.error('Weather data by record error:', error);
    res.status(500).json({
      success: false,
      message: '気象データの取得に失敗しました'
    });
  }
}