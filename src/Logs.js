import React, { useState, useEffect } from 'react';
import axios from 'axios';
import address from './EdNFTs-address.json'; // Assuming this JSON file holds your address
import './styles.css';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(
                `https://api-sepolia.etherscan.io/api?module=logs&action=getLogs&address=${address.address}&fromBlock=4191708&toBlock=4936365&page=1&offset=1000&apikey=WTBHPNTRHID146A59J2RUCEDH1SFR6HRBS`
            );
            const { result } = response.data;
            const formattedLogs = result.map(log => {
                const topicsText = log.topics.map(topic => topic.substring(0, 10)); // Convert topics to text
                return {
                    ...log,
                    topicsText: topicsText.join(', ')
                };
            });
            setLogs(formattedLogs);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <div>
            <h2>Ethereum Logs</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    {logs.map((log, index) => (
                        <li key={index}>
                            <p>Topics: {log.topicsText}</p>
                            <p>Data: {log.data}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Logs;
