import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Usuario creado correctamente. Redirigiendo al login...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(data.error || 'Error al crear usuario');
      }
    } catch (err) {
      setError('Error de red o servidor');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          height: '340px',
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
        }}>Create account</h2>
        <form onSubmit={handleCreateAccount} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
          >Create account</button>
        </form>
        <button
          onClick={() => navigate('/login')}
          style={{
            width: '80%',
            padding: '0.5rem',
            borderRadius: '5px',
            background: '#b81414',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >Back</button>
        {(error || success) && (
          <div style={{
            marginTop: '1rem',
            width: '73%',
            textAlign: 'center',
            fontSize: '0.9rem',
            padding: '0.5rem',
            borderRadius: '5px',
            color: error ? 'red' : 'green'
          }}>
            {error || success}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAccountPage;