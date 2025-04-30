import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignInPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/login'); // Redirige a la página de inicio de sesión después de crear cuenta
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{ 
          height: '40%', 
          width: '1000%', 
          padding: '2rem', 
          background: '#f1f7ed', 
          borderRadius: '20px', 
          boxShadow: '0 0 10px rgba(0,0,0,0.2)', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-start', 
          alignItems: 'center', 
          margin: 'auto' 
        }}
      >
        <h2 style={{ 
          color: 'black', 
          textAlign: 'center', 
          marginBottom: '1rem' 
        }}>Create account</h2>
        <input 
          type="text" 
          placeholder="User" 
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
          onClick={handleSignUp} 
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
      </div>
    </div>
  );
};

export default SignInPage;