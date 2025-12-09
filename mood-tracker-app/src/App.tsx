import { useState, useEffect, lazy, Suspense } from 'react';
import './App.css';
import { isAuthenticated } from './services/authService';
import { fetchCsrfToken } from './services/api';
import PerformanceReport from './components/PerformanceReport';
import WebVitalsDashboard from './components/WebVitalsDashboard';
import { AccessControl } from './components/auth/AccessControl';

// ローディングコンポーネント
const LoadingSpinner = () => (
  <div className="loading-spinner" style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    fontSize: '1.2rem',
    color: '#666'
  }}>
    <div>読み込み中...</div>
  </div>
);

// 遅延ロードするコンポーネント
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const RecordForm = lazy(() => import('./components/RecordForm'));
const RecordList = lazy(() => import('./components/RecordList'));
const RecordDetail = lazy(() => import('./components/RecordDetail'));
const AnalysisForm = lazy(() => import('./components/AnalysisForm'));
const AdviceHistory = lazy(() => import('./components/AdviceHistory'));
const Layout = lazy(() => import('./components/layout/Layout'));

function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [recordDetailId, setRecordDetailId] = useState<number | null>(null);
  const [showRegister, setShowRegister] = useState<boolean>(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());

    // CSRFトークンを初期化（エラーを無視）
    fetchCsrfToken().catch((error) => {
      console.warn('初期CSRFトークン取得失敗:', error);
    });
  }, []);

  const handleLoginSuccess = () => {
    setAuthenticated(true);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setCurrentPage('dashboard');
    setShowRegister(false);
  };

  const handleSwitchToRegister = () => {
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
  };

  const handleNavigate = (page: string) => {
    // record-detail/123 のような形式をパース
    if (page.startsWith('record-detail/')) {
      const id = parseInt(page.split('/')[1]);
      setRecordDetailId(id);
      setCurrentPage('record-detail');
    } else {
      setCurrentPage(page);
      setRecordDetailId(null);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'record':
        return <RecordForm onNavigate={handleNavigate} />;
      case 'analysis':
        return <AnalysisForm onNavigate={handleNavigate} />;
      case 'record-list':
        return <RecordList onNavigate={handleNavigate} />;
      case 'record-detail':
        return recordDetailId ? (
          <RecordDetail recordId={recordDetailId} onNavigate={handleNavigate} />
        ) : (
          <Dashboard onNavigate={handleNavigate} />
        );
      case 'advice-history':
        return <AdviceHistory onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <AccessControl>
      <div className="App">
        {authenticated ? (
          <Suspense fallback={<LoadingSpinner />}>
            <Layout
              onLogout={handleLogout}
              currentPage={currentPage}
              onNavigate={handleNavigate}
            >
              <Suspense fallback={<LoadingSpinner />}>
                {renderPage()}
              </Suspense>
            </Layout>
          </Suspense>
        ) : (
          <Suspense fallback={<LoadingSpinner />}>
            {showRegister ? (
              <Register
                onRegisterSuccess={handleLoginSuccess}
                onSwitchToLogin={handleSwitchToLogin}
              />
            ) : (
              <Login
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={handleSwitchToRegister}
              />
            )}
          </Suspense>
        )}

        {/* パフォーマンス監視（開発環境のみ） */}
        <PerformanceReport />
        <WebVitalsDashboard />
      </div>
    </AccessControl>
  );
}

export default App;
