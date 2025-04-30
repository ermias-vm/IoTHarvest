import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import LogInPage from './components/LoginPage';
import CreateAccountPage from './components/CreateAccountPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" />
              : <LogInPage onLogIn={() => setIsAuthenticated(true)} />
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated
              ? <Dashboard />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/create-account"
          element={<CreateAccountPage />}
        />
        <Route
          path="/login"
          element={<LogInPage onLogIn={() => setIsAuthenticated(true)} />}
        />
      </Routes>
    </Router>
  );
}

export default App;