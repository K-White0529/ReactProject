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