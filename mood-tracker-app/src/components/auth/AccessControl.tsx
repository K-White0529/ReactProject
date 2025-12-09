import { useState, useEffect } from 'react';
import './AccessControl.css';

interface AccessControlProps {
  children: React.ReactNode;
}

export function AccessControl({ children }: AccessControlProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // CI環境またはアクセス制御が無効化されている場合はスキップ
  const isAccessControlEnabled = import.meta.env.VITE_ACCESS_PASSWORD && 
                                  import.meta.env.VITE_ENABLE_ACCESS_CONTROL !== 'false';

  useEffect(() => {
    // アクセス制御が無効の場合は常に認証済みとする
    if (!isAccessControlEnabled) {
      setIsAuthorized(true);
      setIsLoading(false);
      return;
    }

    const auth = sessionStorage.getItem('app_authorized');
    if (auth === 'true') {
      setIsAuthorized(true);
    }
    setIsLoading(false);
  }, [isAccessControlEnabled]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const correctPassword = import.meta.env.VITE_ACCESS_PASSWORD;

    if (!correctPassword) {
      setError('アクセスパスワードが設定されていません');
      return;
    }

    if (password === correctPassword) {
      sessionStorage.setItem('app_authorized', 'true');
      setIsAuthorized(true);
      setError('');
    } else {
      setError('パスワードが正しくありません');
      setPassword('');
    }
  };

  if (isLoading) {
    return (
      <div className="access-control-container">
        <div className="access-control-loading">読み込み中...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="access-control-container">
        <div className="access-control-card">
          <div className="access-control-header">
            <h2>調子記録アプリ</h2>
            <p>アクセスにはパスワードが必要です</p>
          </div>
          <form onSubmit={handleAuth} className="access-control-form">
            <div className="form-group">
              <label htmlFor="password">パスワード</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                className="form-input"
                autoFocus
                required
              />
            </div>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            <button type="submit" className="submit-button">
              アクセス
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
