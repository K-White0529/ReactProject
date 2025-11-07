// ユーザー関連の型
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// 記録データ関連の型
export interface Record {
  id: number;
  user_id: number;
  recorded_at: string;
  sleep_hours?: number;
  sleep_quality?: number;
  meal_quality?: number;
  meal_regularity?: number;
  exercise_minutes?: number;
  exercise_intensity?: number;
  emotion_score?: number;
  emotion_note?: string;
  motivation_score?: number;
  activities_done?: string;
  created_at: string;
  updated_at: string;
}

export interface RecordInput {
  recorded_at?: string;
  sleep_hours?: number;
  sleep_quality?: number;
  meal_quality?: number;
  meal_regularity?: number;
  exercise_minutes?: number;
  exercise_intensity?: number;
  emotion_score?: number;
  emotion_note?: string;
  motivation_score?: number;
  activities_done?: string;
}

// APIレスポンスの型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

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

// 統計情報の型
export interface RecordStats {
  total_records: number;
  this_week_records: number;
  avg_emotion_score?: number;
  avg_motivation_score?: number;
  latest_record_date?: string;
}

// グラフデータの型
export interface ChartDataPoint {
  date: string;
  avg_emotion?: number;
  avg_motivation?: number;
  avg_temperature?: number;
  avg_humidity?: number;
  weather_condition?: string;
}

export interface ChartData {
  mood: ChartDataPoint[];
  weather: ChartDataPoint[];
}

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  weatherCondition: string;
  location: string;
}