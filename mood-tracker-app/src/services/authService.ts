import api from './api';
import type { UserLogin, UserRegistration, AuthResponse, User, ApiResponse } from '../types';

/**
 * ユーザー登録
 */
export async function register(userData: UserRegistration): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/register', userData);

  if (response.data.success && response.data.data) {
    // トークンとユーザー情報をlocalStorageに保存
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    return response.data.data;
  }

  throw new Error(response.data.message || '登録に失敗しました');
}

/**
 * ログイン
 */
export async function login(credentials: UserLogin): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', credentials);

  if (response.data.success && response.data.data) {
    // トークンとユーザー情報をlocalStorageに保存
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    return response.data.data;
  }

  throw new Error(response.data.message || 'ログインに失敗しました');
}

/**
 * ログアウト
 */
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * 現在のユーザー情報を取得
 */
export async function getCurrentUser(): Promise<User> {
  const response = await api.get<ApiResponse<User>>('/api/auth/me');

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'ユーザー情報の取得に失敗しました');
}

/**
 * ログイン状態をチェック
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  return token !== null;
}

/**
 * 保存されているユーザー情報を取得
 */
export function getStoredUser(): User | null {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }
  return null;
}