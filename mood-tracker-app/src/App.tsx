import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/layout/Layout';
import { isAuthenticated } from './services/authService';

function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  const handleLogout = () => {
    setAuthenticated(false);
  };

  return (
    <div className="App">
      {authenticated ? (
        <Layout onLogout={handleLogout}>
          <Dashboard />
        </Layout>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;