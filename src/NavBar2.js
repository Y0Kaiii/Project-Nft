import React, {useEffect, useState} from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './styles.css';
import logo from './assets/images/EdenVerden.png';
import axios from 'axios';
import queryString from 'query-string';


import { apiPath } from './config'; // Update the path as per your project structure

const NavBar = ({accounts, setAccounts}) => {
    const isConnected = Boolean(accounts[0]);
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [name, setName] = useState('');

    const login = async () => {
      try {
        // OAuth Step 1
        const response = await axios.post(`${apiPath}/twitter/oauth/request_token`);
        const { oauth_token } = response.data;
        // OAuth Step 2
        window.location.href = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;
      } catch (error) {
        console.error(error);
      }
    };
  
    const logout = async () => {
      try {
        await axios.post(`${apiPath}/twitter/logout`);
        setIsLoggedIn(false);
      } catch (error) {
        console.error(error);
      }
    };

    useEffect(() => {
    const fetchData = async () => {
      const { oauth_token, oauth_verifier } = queryString.parse(window.location.search);

      if (oauth_token && oauth_verifier) {
        try {
          // OAuth Step 3
          await axios.post(`${apiPath}/twitter/oauth/access_token`, { oauth_token, oauth_verifier });
        } catch (error) {
          console.error(error);
        }
      }

      try {
        // Authenticated Resource Access
        const { data } = await axios.get(`${apiPath}/twitter/users/profile_banner`);
        const { name } = data;

        setIsLoggedIn(true);
        setName(name);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

    async function connectAccount(){
        if (window.ethereum) {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            setAccounts(accounts);
        }
    }

    const handleLoginClick = () => {
        navigate("/login");
      };

    return (
        <header>
        <nav>
            <div className="logo">
                <img src={logo} alt="Eden"></img>
                <h1>EDEN VERDEN</h1>
            </div>
                    <ul className="nav-links">
                        <li><Link to="/">Mint</Link></li>
                        <li><a href="#">RoadMap</a></li>                        
                        <li><Link to="/mint-settings">Mint Settings</Link></li>
        {isConnected ? (
            <li><button className="connected-button">'Connected'</button></li>
        ) : (
            <li><button className="connect-button" onClick={connectAccount}>Connect Wallet</button></li>
        )}
        {isLoggedIn ? `Welcome, ${name}` : 'Please sign in'}
        {isLoggedIn ? (
          <button onClick={logout}>Sign Out</button>
        ) : (
          <button onClick={login}>Sign In with Twitter</button>
        )}
        </ul>
       </nav>
       </header>

    );
};

export default NavBar;