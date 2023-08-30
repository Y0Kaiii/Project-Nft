import React from "react";
import { Link } from 'react-router-dom';
import './styles.css';

const NavBar = ({accounts, setAccounts}) => {
    const isConnected = Boolean(accounts[0]);

    async function connectAccount(){
        if (window.ethereum) {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            setAccounts(accounts);
        }
    }
    return (
        <header>
        <nav>
            <div className="logo">
            <h1>EDENVERDEN</h1>
            </div>
                    <ul className="nav-links">
                        <li><Link to="/">Mint</Link></li>
                        <li><a href="#">RoadMap</a></li>
                        <li><Link to="/mint-settings">Mint Settings</Link></li>
        {isConnected ? (
            <p>Connected</p>
        ) : (
            <li><button className="connect-button" onClick={connectAccount}>Connect</button></li>
        )}
        </ul>
       </nav>
       </header>

    );
};

export default NavBar;