// MintSettings.js
import React, { useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import EdNFTs from './EdNFTs.json'; // Your contract ABI
import edNFTsAddress from './EdNFTs-address.json'
import './styles.css';



function MintSettings() {
  const [newMintPrice, setNewMintPrice] = useState('');
  const [newMaxSupply, setNewMaxSupply] = useState('');
  const [newPublicMint, setNewPublicMint] = useState(false);
  const [newBaseTokenURI, setNewBaseTokenURI] = useState('');

  async function handleUpdateMintPrice() {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        edNFTsAddress.address,
        EdNFTs.abi,
        signer
      );
      const newMintPriceInWei = ethers.utils.parseEther(newMintPrice);
      await contract.updateMintPrice(newMintPriceInWei);
    }
  }

  async function handleUpdateMaxSupply() {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        edNFTsAddress.address,
        EdNFTs.abi,
        signer
      );
      
      const newMaxSupplyAsBigNumber = BigNumber.from(newMaxSupply);
      await contract.updateMaxSupply(newMaxSupplyAsBigNumber);
    }
  }

  async function handleUpdatePublicMint() {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        edNFTsAddress.address,
        EdNFTs.abi,
        signer
      );
      
      await contract.setIsPublicMintEnabled(newPublicMint);
      
    }
  }

  async function handleUpdateBaseTokenURI() {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        edNFTsAddress.address,
        EdNFTs.abi,
        signer
      );

      await contract.setBaseTokenUri(newBaseTokenURI);

    }
  }



  return (
    <div className="MintSettings">
      <h2>Minting Settings</h2>
      <div>
        <label>New Mint Price:</label>
        <input
          type="text"
          value={newMintPrice}
          onChange={(e) => setNewMintPrice(e.target.value)}
        />
        <button onClick={handleUpdateMintPrice}>Update Mint Price</button>
      </div>
      <div>
        <label>New Max Supply:</label>
        <input
          type="text"
          value={newMaxSupply}
          onChange={(e) => setNewMaxSupply(e.target.value)}
        />
        <button onClick={handleUpdateMaxSupply}>Update Max Supply</button>
      </div>
      <div>
        <label>Minting Enabled:</label>
        <input
          type="text"
          value={newPublicMint}
          onChange={(e) => setNewPublicMint(e.target.value)}
        />
        <button onClick={handleUpdatePublicMint}>Update Minting Enabled</button>
      </div>
      <div>
        <label>Base Token URI:</label>
        <input
          type="text"
          value={newBaseTokenURI}
          onChange={(e) => setNewBaseTokenURI(e.target.value)}
        />
        <button onClick={handleUpdateBaseTokenURI}>Update Base Token URI</button>
      </div>
    </div>
  );
}

export default MintSettings;

