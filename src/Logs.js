import React, { useState, useEffect } from 'react';
import axios from 'axios';
import address from './EdNFTs-address.json'; // Assuming this JSON file holds your address
import './styles.css';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(
                `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address.address}&startblock=4929245&endblock=99999999&page=1&offset=10&sort=asc&apikey=${process.env.REACT_APP_ETHERSCAN_KEY}`
            );
            const { result } = response.data;
            setTransactions(result);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const convertTimestamp = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString();
    };

    return (
        <div>
            <h2 style={{ color: 'Black',justifyContent: 'center', alignItems: 'center', display: 'flex' }}>Ethereum Logs</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul style={{ color: 'white' }}>
                    {transactions.map((tx, index) => (
                        <li key={index}>
                            <p>--------------------------</p>
                            <p>From: {tx.from}</p>
                            <p>To: {tx.to}</p>
                            <p>Timestamp: {convertTimestamp(tx.timeStamp)}</p>
                            <p>Value: {tx.value}</p>
                            <p>Gas: {tx.gas}</p>                      
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Logs;
