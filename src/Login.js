import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Custom hook to parse query parameters
const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const Login = () => {
    const [username, setUsername] = useState('');
    const query = useQuery();

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

    return (
        <div>
            {username ? (
                <h1>Welcome, {username}!</h1>
            ) : (
                <div>
                <button onClick={handleTwitterLogin}>Login with Twitter</button>
                <button onClick={handleDiscordLogin}>Login with Discord</button>
                </div>
            )}
        </div>
    );
};

export default Login;