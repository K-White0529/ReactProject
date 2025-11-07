import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RecordForm from './components/RecordForm';
import Layout from './components/layout/Layout';
import { isAuthenticated } from './services/authService';

function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

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
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'record':
        return <RecordForm />;
      case 'analysis':
        return <div className="page-placeholder">分析画面は次のステップで実装します</div>;
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