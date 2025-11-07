// ユーザー関連の型
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
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

// 記録データ関連の型
export interface Record {
  id: number;
  user_id: number;
  recorded_at: Date;
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
  created_at: Date;
  updated_at: Date;
}

export interface RecordInput {
  recorded_at?: Date;
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

// JWT認証用の型
export interface JwtPayload {
  userId: number;
  username: string;
}

// APIレスポンスの型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}