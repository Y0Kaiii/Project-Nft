import React, {useEffect, useState} from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './styles.css';
import logo from './assets/images/EdenVerden.png';
import axios from 'axios';

const NavBar = ({accounts, setAccounts}) => {
    const isConnected = Boolean(accounts[0]);
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [whitePaperUrl, setWhitePaperUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    

    useEffect(() => {
        const fetchUsername = async () => {
          try {
            const response = await axios.get('/api/twitter/users/profile_banner');
            setUsername(response.data.name);
          } catch (error) {
            console.error('Error fetching username:', error);
          }
        };
    
        fetchUsername();
      }, []);

    useEffect(() => {
        const checkAuth = async () => {
          try {
            const response = await axios.get('http://localhost:5000/protected');
            setIsAuthenticated(true);
          } catch (error) {
            setIsAuthenticated(false);
          }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        const fetchWhitePaperUrl = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5000/white-paper-url');
                if (response.data.url) {
                    setWhitePaperUrl(response.data.url);
                }
            } catch (error) {
                setError(error.message);
            }
            setLoading(false);
        };

        fetchWhitePaperUrl();
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

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
    };

    return (
        <header>
        <nav>
                    <ul className="nav-links">
                        <li><Link to="/">Mint</Link></li>
                        <li><Link to="/logs">Logs</Link></li>                     
                        <li><Link to="/mint-settings">Mint Settings</Link></li>
                        <li><Link to="/NFTUpload">NFTUpload</Link></li>
                        
        {isConnected ? (
            <li><button className="connected-button">Connected</button></li>
        ) : (
            <li><button className="connect-button" onClick={connectAccount}>Connect Wallet</button></li>
        )}
        </ul>
       </nav>
       </header>

    );
};

export default NavBar;