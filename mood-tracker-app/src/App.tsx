import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RecordForm from './components/RecordForm';
import RecordList from './components/RecordList';
import RecordDetail from './components/RecordDetail';
import AnalysisForm from './components/AnalysisForm';
import Layout from './components/layout/Layout';
import { isAuthenticated } from './services/authService';

function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [recordDetailId, setRecordDetailId] = useState<number | null>(null);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setCurrentPage('dashboard');
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
        return <AnalysisForm />;
      case 'record-list':
        return <RecordList onNavigate={handleNavigate} />;
      case 'record-detail':
        return recordDetailId ? (
          <RecordDetail recordId={recordDetailId} onNavigate={handleNavigate} />
        ) : (
          <Dashboard onNavigate={handleNavigate} />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      {authenticated ? (
        <Layout
          onLogout={handleLogout}
          currentPage={currentPage}
          onNavigate={handleNavigate}
        >
          {renderPage()}
        </Layout>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;