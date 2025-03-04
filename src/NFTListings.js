// NFTListings.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import edNFTsAddress from './EdNFTs-address.json';
import './styles.css';

const NFTListings = () => {
  const [nfts, setNFTs] = useState([]);
  
  // Constants for the chain and contract address
  const chain = 'sepolia';
  const contractAddress = edNFTsAddress.address;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Headers object containing any required headers
        const headers = {
          'Content-Type': 'application/json', // Example header
          // Add any other headers you need
        };

        // Use template literals to insert the chain and contract address into the URL
        const response = await axios.get(`https://testnets-api.opensea.io/api/v2/chain/${chain}/contract/${contractAddress}/nfts`, {
          headers: headers,
        });
        
        // Extract relevant data from the Sepolia/OpenSea API response
        const nftData = response.data.nfts;

        // Update the state with the fetched NFTs
        setNFTs(nftData);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      }
    };

    // Call the fetchData function
    fetchData();
  }, []); // The empty dependency array ensures that this effect runs once when the component mounts

  return (
    <section className='nft-listings-cover'>
    <div className="nft-listings-container">
      <h2>Explore recently Listed</h2>
      <ul className="nft-list">
        {Array.isArray(nfts) && nfts.length > 0 ? (
          nfts.map(nft => (
            <li key={nft.identifier} className="nft-item">
            <div className="nft-content">
            <div className="nft-text">
              {/* Display relevant NFT information */}
              <div>ID: {nft.identifier}</div>
              <div>Name: {nft.name}</div>
            </div>
              <div className="nft-image">
                {/* Display the NFT picture */}
                <img src={nft.image_url} alt={`NFT ${nft.identifier}`} style={{ maxWidth: '250px' }} />
              </div>
            </div>
              {/* Add more details as needed */}
            </li>
          ))
        ) : (
          <li>No NFTs available</li>
        )}
      </ul>
    </div>
    <div className='NFT-view-container'>
    <button className='NFT-view-more' onClick={() => window.open("https://testnets.opensea.io/collection/ednft-5", "_blank")}>View more</button>
    </div>
    </section>
  );
};

export default NFTListings;
