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

    // Function to initiate the Twitter login flow
    const handleTwitterLogin = async () => {
        try {
            // Request a token from the backend
            const response = await axios.get('http://localhost:5000/request-token');
            const { oauth_token } = response.data;

            console.log('OAuth Token:', oauth_token); // Debug log

            // Redirect user to Twitter for authentication
            const twitterAuthUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;
            window.location.href = twitterAuthUrl;
        } catch (error) {
            console.error('Error initiating login with Twitter:', error);
        }
    };

     // Function to initiate the Discord login flow
     const handleDiscordLogin = () => {
        window.location.href = 'http://localhost:5000/discord/login';
    };

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
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                <button onClick={handleLogin}>Login</button>
                <button onClick={handleTwitterLogin}>Login with Twitter</button>
                <button onClick={handleDiscordLogin}>Login with Discord</button>
                {message && <p>{message}</p>}
                </div>
            )}
        </div>
    );
};

export default Login;