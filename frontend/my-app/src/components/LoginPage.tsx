import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  onLogIn: () => void;
};

const LogInPage: React.FC<Props> = ({ onLogIn }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        onLogIn(); // Cambia el estado de autenticación en App.tsx
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Red or server error');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{ 
          height: '320px',
          width: '220px',
          padding: '2rem', 
          background: '#f1f7ed', 
          borderRadius: '20px', 
          boxShadow: '0 0 10px rgba(0,0,0,0.2)', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-start', 
          alignItems: 'center' 
       }}
      >
        <h2 style={{ 
          color: 'black', 
          textAlign: 'center', 
          marginBottom: '1rem' 
        }}>Log In</h2>
        <form onSubmit={handleLogIn} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input 
            type="email" 
            placeholder="E-mail" 
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ 
              width: '80%', 
              padding: '0.5rem', 
              marginBottom: '1rem', 
              borderRadius: '5px', 
              border: '1px solid #7ca982',
              background: 'none',
              color: 'black' 
            }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ 
              width: '80%', 
              padding: '0.5rem', 
              marginBottom: '1rem', 
              borderRadius: '5px', 
              border: '1px solid #7ca982',
              background: 'none',
              color: 'black' 
            }}
          />
          <button 
            type="submit"
            style={{ 
              width: '80%', 
              padding: '0.5rem', 
              marginBottom: '1rem', 
              borderRadius: '5px', 
              background: '#7ca982', 
              color: 'white', 
              border: 'none', 
              cursor: 'pointer' 
            }}
          >Entrar</button>
        </form>
        <button 
          onClick={() => navigate('/create-account')} 
          style={{ 
            width: '80%', 
            padding: '0.5rem', 
            borderRadius: '5px', 
            background: '#7ca982', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer' 
          }}
        >Create Account</button>
          {error && (
            <div style={{
              color: '#b81414',
              backgroundColor: '#ffe6e6',
              padding: '0.5rem',
              borderRadius: '5px',
              marginTop: '1rem',
              fontSize: '0.9rem',
              textAlign: 'center',
              width: '73%',
            }}>
              {error}
            </div>
          )}
      </div>
    </div>
  );
};

export default LogInPage;