import { Request, Response } from 'express';
import { getCurrentWeather } from '../services/weatherService';

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