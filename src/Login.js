import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Custom hook to parse query parameters
const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('');
    const query = useQuery();

    axios.interceptors.request.use(config => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });

    // Use effect to extract the username from query params when component mounts
    useEffect(() => {
        const usernameFromQuery = query.get('username');
        if (usernameFromQuery) {
            setUsername(usernameFromQuery);
        }
    }, [query]);

    const handleLogin = async () => {
        try {
          const response = await axios.post('http://localhost:5000/login', { email, password });
          localStorage.setItem('authToken', response.data.token);
          setMessage(response.data.message);
        } catch (error) {
          setMessage('Login failed');
        }
      };

    return (
        <div>
        {username ? (
          <h1>Welcome, {username}!</h1>
        ) : (
          <div>
            <h1>Login</h1>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
            <button onClick={handleLogin}>Login</button>
            {message && <p>{message}</p>}
          </div>
        )}
      </div>
    );
  };



export default Login;