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

    return (
        <header>
        <nav>
            <div className="logo">
                <img src={logo} alt="Eden"></img>
                <h1>EDEN VERDEN</h1>
            </div>
                    <ul className="nav-links">
                        <li><Link to="/">Mint</Link></li>
                        <li><Link to="/logs">Logs</Link></li>                     
                        <li><Link to="/mint-settings">Mint Settings</Link></li>
                        <li><Link to="/Login">Login</Link></li>
                        {loading ? (
                        <li>Loading...</li>
                    ) : error ? (
                        <li>Error: {error}</li>
                    ) : (
                        whitePaperUrl && <li><a href={whitePaperUrl}>White Paper</a></li>
                    )}
        {isConnected ? (
            <li><button className="connected-button">'</button></li>
        ) : (
            <li><button className="connect-button" onClick={connectAccount}>Connect Wallet</button></li>
        )}
        </ul>
       </nav>
       </header>

    );
};

export default NavBar;