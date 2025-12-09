import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Axiosインスタンスの作成
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 60000, // 60秒（AI分析用に延長）
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Cookie送信を許可（CSRF対策）
});

/**
 * CSRFトークンを取得してlocalStorageに保存
 */
export async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await axios.get(`${api.defaults.baseURL}/api/security/csrf-token`, {
      withCredentials: true,
    });
    const csrfToken = response.data.csrfToken;
    localStorage.setItem('csrfToken', csrfToken);
    return csrfToken;
  } catch (error) {
    console.error('CSRF token fetch error:', error);
    throw error;
  }
}

/**
 * CSRFトークンを更新（トークンエラー時）
 */
export async function refreshCsrfToken(): Promise<void> {
  await fetchCsrfToken();
}

// リクエストインターセプター: 全てのリクエストにトークンとCSRFトークンを追加
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // JWTトークンの追加
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // CSRFトークンの追加（POST、PUT、DELETEメソッドのみ）
    if (config.method && ['post', 'put', 'delete'].includes(config.method.toLowerCase())) {
      let csrfToken = localStorage.getItem('csrfToken');
      
      // CSRFトークンが存在しない場合は取得
      if (!csrfToken) {
        try {
          csrfToken = await fetchCsrfToken();
        } catch (error) {
          console.error('Failed to fetch CSRF token:', error);
        }
      }
      
      if (csrfToken && config.headers) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター: エラーハンドリング
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401エラー: 認証エラー
    if (error.response?.status === 401) {
      // トークンを削除してログイン画面へ
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      return Promise.reject(error);
    }

    // 403エラー: CSRF トークンエラーの可能性
    if (error.response?.status === 403 && error.response?.data?.message === 'invalid csrf token') {
      // CSRFトークンを再取得してリトライ（1回のみ）
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await refreshCsrfToken();
          return api(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
