import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
    const [profile, setProfile] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [newProfile, setNewProfile] = useState({});
    const [walletAddress, setWalletAddress] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            const response = await axios.get('/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);
            setNewProfile(response.data);
        };

        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProfile({ ...newProfile, [name]: value });
    };

    const handleUpdateProfile = async () => {
        const token = localStorage.getItem('token');
        await axios.post('/update-profile', newProfile, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(newProfile);
        setEditMode(false);
    };

    const handleLinkWallet = async () => {
        const token = localStorage.getItem('token');
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const walletAddress = window.ethereum.selectedAddress;
        await axios.post('/link-wallet', { walletAddress }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setWalletAddress(walletAddress);
    };

    return (
        <div>
            <h2>Profile</h2>
            {editMode ? (
                <div>
                    <input 
                        name="name" 
                        value={newProfile.name} 
                        onChange={handleInputChange} 
                        placeholder="Name" 
                    />
                    <input 
                        name="age" 
                        value={newProfile.age} 
                        onChange={handleInputChange} 
                        placeholder="Age" 
                    />
                    <input 
                        name="profilePicture" 
                        value={newProfile.profilePicture} 
                        onChange={handleInputChange} 
                        placeholder="Profile Picture URL" 
                    />
                    <button onClick={handleUpdateProfile}>Save</button>
                    <button onClick={() => setEditMode(false)}>Cancel</button>
                </div>
            ) : (
                <div>
                    <p><strong>Name:</strong> {profile.name}</p>
                    <p><strong>Age:</strong> {profile.age}</p>
                    <p><strong>Profile Picture:</strong> <img src={profile.profilePicture} alt="Profile" /></p>
                    <p><strong>Account ID:</strong> {profile.userId}</p>
                    <p><strong>Wallet Address:</strong> {walletAddress}</p>
                    <button onClick={() => setEditMode(true)}>Edit Profile</button>
                    <button onClick={handleLinkWallet}>Link MetaMask Wallet</button>
                </div>
            )}
        </div>
    );
};

export default Profile;