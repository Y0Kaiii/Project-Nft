import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchAccessToken = async () => {
            const params = new URLSearchParams(location.search);
            const oauth_token = params.get('oauth_token');
            const oauth_verifier = params.get('oauth_verifier');

            if (oauth_token && oauth_verifier) {
                try {
                    const response = await axios.get(`http://localhost:5000/access-token?oauth_token=${oauth_token}&oauth_verifier=${oauth_verifier}`);
                    const { username } = response.data;
                    console.log('Authenticated user:', username);
                    navigate('/');
                } catch (error) {
                    console.error('Error fetching access token:', error);
                }
            }
        };

        fetchAccessToken();
    }, [location, navigate]);

    const handleAuthorizeClick = async () => {
        try {
            const response = await axios.get('http://localhost:5000/request-token');
            const { oauth_token } = response.data;
            window.location.href = `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`;
        } catch (error) {
            console.error('Error requesting token:', error);
        }
    };

    return (
        <div className="login">
            <h2>Login with Twitter</h2>
            <button onClick={handleAuthorizeClick}>Authorize with Twitter</button>
        </div>
    );
};

export default Login;