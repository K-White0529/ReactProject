import axios from 'axios';

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_URL = process.env.WEATHER_API_URL;

interface WeatherData {
  temperature: number;
  humidity: number;
  weatherCondition: string;
  location: string;
}

interface WeatherApiResponse {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    humidity: number;
    condition: {
      text: string;
    };
  };
}

/**
 * 指定した都市の現在の気象データを取得
 */
export async function getCurrentWeather(city: string = 'Tokyo'): Promise<WeatherData | null> {
  try {
    if (!WEATHER_API_KEY) {
      console.error('Weather API key is not configured');
      return null;
    }

    const response = await axios.get<WeatherApiResponse>(`${WEATHER_API_URL}/current.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: city,
        aqi: 'no'
      }
    });

    const data = response.data;

    return {
      temperature: data.current.temp_c,
      humidity: data.current.humidity,
      weatherCondition: data.current.condition.text,
      location: `${data.location.name}, ${data.location.country}`
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return null;
  }
}

/**
 * 緯度経度から気象データを取得
 */
export async function getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    if (!WEATHER_API_KEY) {
      console.error('Weather API key is not configured');
      return null;
    }

    const response = await axios.get<WeatherApiResponse>(`${WEATHER_API_URL}/current.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: `${lat},${lon}`,
        aqi: 'no'
      }
    });

    const data = response.data;

    return {
      temperature: data.current.temp_c,
      humidity: data.current.humidity,
      weatherCondition: data.current.condition.text,
      location: `${data.location.name}, ${data.location.country}`
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return null;
  }
}