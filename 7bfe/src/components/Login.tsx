import React, { useState } from 'react';
import axios from 'axios';
import { User } from '../models/User';
import '../styles/Login.css';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post('https://localhost:7167/api/auth/login', { email, password });
      onLoginSuccess(response.data); // Pass the logged-in user to the parent component
    } catch (error) {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className='login-div'>
        <h2>Login to Profile</h2>
        <form onSubmit={handleLogin} className='login'>
      <div className="form-group">
        <label>Email: </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Password: </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit" className="submit-btn">Login</button>
      {error && <p>{error}</p>}
    </form>
    <p>Or create account on user page.</p>
    </div>
    
  );
};

export default Login;
