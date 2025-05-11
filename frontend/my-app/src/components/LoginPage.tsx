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
        localStorage.setItem('userEmail', username);
        onLogIn();
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Red or server error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#b7d2b3' // Verde claro para fondo
    }}>
      <div
        style={{ //Formulario login, caja blanca
          width: '370px',
          maxWidth: '95vw',
          padding: '2.7rem 2.2rem',
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 0 18px rgba(0,0,0,0.13)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          minHeight: '470px',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        <h2 style={{
          color: '#222',
          textAlign: 'center',
          marginBottom: '2rem',
          fontWeight: 700,
          fontSize: '2rem',
          letterSpacing: '1px'
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
              color: 'black',
              fontSize: '1rem',
              boxSizing: 'border-box'
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
              color: 'black',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            style={{
              width: '80%',
              padding: '0.5rem',
              marginBottom: '0.7rem',
              borderRadius: '5px',
              background: '#7ca982',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              letterSpacing: '0.5px',
              boxSizing: 'border-box'
            }}
          >Login</button>
        </form>
        {/* Mensaje de error, ocupa espacio fijo para no ampliar la caja */}
        <div style={{
          minHeight: '1.5em',
          marginTop: '0.2em',
          marginBottom: '0.2em',
          width: '80%',
          textAlign: 'center'
        }}>
          {error && (
            <span style={{
              color: 'red',
              fontSize: '1rem'
            }}>
              {error}
            </span>
          )}
        </div>
        <div style={{
          marginTop: '3.5rem',
          fontSize: '1rem',
          color: '#333',
          textAlign: 'center',
          width: '100%',
        }}>
          Don't have an account?{' '}
          <span
            style={{
              color: '#2d7a46',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: 500
            }}
            onClick={() => navigate('/create-account')}
          >
            Sign up
          </span>
        </div>
      </div>
    </div>
  );
};

export default LogInPage;