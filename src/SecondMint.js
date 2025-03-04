import { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import edNFTs from './EdNFTs.json'
import edNFTsAddress from './EdNFTs-address.json'
//import "react-popup/style.css";
//import Popup from "react-popup";
import './Popup.css';
import './SecondMint.css';
import Mascot from './assets/images/Mascot.png'

const SecondMint = ({ accounts, setAccounts}) => {
    const [NFTAmount, setNFTAmount] = useState(1);
    const [remainingSupply, setRemainingSupply] = useState(0);
    const [totalSupply, setTotalSupply] = useState(0);
    const isConnected = Boolean(accounts[0]);
    const [showPopup, setShowPopup] = useState(false);
    const [overMintPopup, setoverMintPopup] = useState(false);
    const [serialNumber, setSerialNumber] = useState(""); // New state for Serial Number
    const [successRedeemPopup, setSuccessRedeemPopup] = useState(false);
    const [invalidSerialPopup, setInvalidSerialPopup] = useState(false);


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

        if (NFTAmount > remainingSupply) {
            setoverMintPopup(true);
            return;
        }

        
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(
                    edNFTsAddress.address,
                    edNFTs.abi,
                    signer
                );
                try {
                    const currentMintPrice = await contract.mintPrice();
                    const NFTAmountBN = ethers.BigNumber.from(1);
                    const mintValue = currentMintPrice.mul(NFTAmountBN);
        
                    // Mint NFTs without serial number validation
                    const response = await contract.mint(NFTAmountBN, {
                        value: mintValue
                    });
        
                    console.log('response', response);
                    setSuccessRedeemPopup(true); // Set success flag to display success message
                } catch (err) {
                    console.log('error', err);
                }
            }
        };

        


    const handleDecrement = () => {
        if (NFTAmount <= 1) return;
        setNFTAmount(NFTAmount - 1);
    }

    const handleIecrement = () => {
        if (NFTAmount >= 20) return;
        setNFTAmount(NFTAmount + 1);
    }

    const handleCloseInvalidSerialPopup = () => {
        setInvalidSerialPopup(false);
    }
    
    const handleCloseSuccessRedeemPopup = () => {
        setSuccessRedeemPopup(false);
    }

    const handleClosePopup = () => {
        setShowPopup(false);
    }

    const handleCloseOverPopup = () => {
        setoverMintPopup(false);
    
    }
    return (
        <section className="second-mint">
        <div className="second-mint-container">
            <div className="left-content">
                <img src={Mascot} alt="Fuzzy Friends" className="NFT-Exam" />
            </div>                
                <div className="right-content">
                <div className="hero-content">
                    <h2>FUZZY FRIENDS</h2>
                    <p>
                    ​Experience the joy of NFT collecting with FUZZY FRIENDS. Our collection of adorable companions is more than just digital art; it's a celebration of friendship and happiness that will never fade. Own your FUZZY FRIEND and join our thriving community of pet lovers.
                    </p>
                <div className="NFT-Exam-Container">
                <div className="supply-info">
                <p>Total Supply in this pool: {totalSupply} &nbsp;&nbsp; Remaining NFTs: {remainingSupply}</p>           
                </div>
                </div>
                {isConnected ? (
                    <div className="main-mint-section">
                        <div className="button-container">                   
                            <button className="mint-button" onClick={handleMint}>Mint your FUZZY FRIENDS</button>
                        </div>
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
                            {successRedeemPopup && (
                                <div className="popup-overlay">
                                    <div className="popup-container">
                                        <h2>Successfully Redeemed!</h2>
                                        <p>Your NFTs have been minted successfully.</p>
                                        <button onClick={handleCloseSuccessRedeemPopup}>Close</button>
                                    </div>
                                </div>
                            )}
                            {invalidSerialPopup && (
                                <div className="popup-overlay">
                                    <div className="popup-container">
                                        <h2>Invalid Serial Number</h2>
                                        <p>The provided serial number does not match any in the database.</p>
                                        <button onClick={handleCloseInvalidSerialPopup}>Close</button>
                                    </div>
                                </div>
                            )}
                    </div>
                ) : (
                    <p>You must be connected to Mint.</p>
                )
                }
                </div>
                </div>
                </div>
        </section>
    );
};

export default SecondMint;