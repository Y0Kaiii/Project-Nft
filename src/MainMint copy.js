import { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import edNFTs from './EdNFTs.json'
import edNFTsAddress from './EdNFTs-address.json'
import "react-popup/style.css";
import Popup from "react-popup";
import './Popup.css';
import './styles.css';


const MainMint = ({ accounts, setAccounts}) => {
    const [mintAmount, setMintAmount] = useState(1);
    const [remainingSupply, setRemainingSupply] = useState(0);
    const [totalSupply, setTotalSupply] = useState(0);
    const isConnected = Boolean(accounts[0]);
    const [showPopup, setShowPopup] = useState(false);
    const [overMintPopup, setoverMintPopup] = useState(false);

    useEffect(() => {
        // Calculate the remaining supply
        const calculateRemainingSupply = async () => {
          if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(
              edNFTsAddress.address,
              edNFTs.abi,
              provider
            );
            try {
                const maxSupply = await contract.getMaxSupply();
                const totalSupply = await contract.getTotalSupply();
                const remaining = maxSupply.sub(totalSupply);
                setRemainingSupply(remaining.toNumber());
                setTotalSupply(maxSupply.toNumber());
              } catch (err) {
                console.log('Error while calculating remaining supply:', err);
              }
            }
          };
          calculateRemainingSupply();
        }, []);
    

    async function handleMint(){
        if (remainingSupply === 0) {
            setShowPopup(true);
            return;
        }

        if (mintAmount > remainingSupply) {
            setoverMintPopup(true);
            return;
        }


        if (window.ethereum){
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                edNFTsAddress.address,
                edNFTs.abi,
                signer
            );
            try {
                const response = await contract.mint(BigNumber.from(mintAmount), {
                    value: ethers.utils.parseEther((0.001 * mintAmount).toString())    
                });
                console.log('response', response);
            } catch (err) {
                console.log('error', err)
            }
        }
    }

    const handleDecrement = () => {
        if (mintAmount <= 1) return;
        setMintAmount(mintAmount - 1);
    }

    const handleIecrement = () => {
        if (mintAmount >= 20) return;
        setMintAmount(mintAmount + 1);
    }


      const handleClosePopup = () => {
        setShowPopup(false);
      };

      const handleCloseOverPopup = () => {
        setoverMintPopup(false);
      }
    return (
        <div className="hero">
            <h2>Welcome to EDENVERDEN!</h2>
            <p> Mint your unique NFT </p>
            {isConnected ? (
                <div className="main-mint-section">
                    <div className="quantity-control">
                        <button className="minus-button" onClick={handleDecrement}>-</button>
                        <input type="number" value={mintAmount} />
                        <button className="plus-button" onClick={handleIecrement}>+</button>
                    </div>
                    <button className="mint-button" onClick={handleMint}>Mint Now</button>
                    {overMintPopup && (
                        <div className="popup-overlay">
                            <div className ="popup-container">
                            <h2>Cannot mint more than the remaining supply!</h2>
                                <p>Remaining Supply: {remainingSupply}</p>
                            <button onClick={handleCloseOverPopup}>Close</button>
                        </div>
                       </div>
                    )}
                        {showPopup && (
                        <div className="popup-overlay">
                            <div className ="popup-container">
                                <h2>Supply has run out!</h2>
                            <button onClick={handleClosePopup}>Close</button>
                        </div>
                        </div>
                    )}
                </div>
            ) : (
                <p>You must be connected to Mint.</p>
            )
            }
            <p className="supply-info">
            <p>Total Supply in this pool: {totalSupply} &nbsp;&nbsp; Remaining NFTs: {remainingSupply}</p>
            </p>
        </div>
        
    );
};

export default MainMint;