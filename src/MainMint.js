import { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import edNFTs from './EdNFTs.json'
import edNFTsAddress from './EdNFTs-address.json'
//import "react-popup/style.css";
//import Popup from "react-popup";
import './Popup.css';
import './styles.css';
import JarLogo from './assets/images/JarLogo.png'
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";


const MainMint = ({ accounts, setAccounts}) => {
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


        if (window.ethereum){
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
        
                // Check if the serial number exists in Firestore
                const isSerialNumberValid = await checkSerialNumberInFirestore(serialNumber);
        
                if (isSerialNumberValid) {
                  // Serial number is valid, proceed with minting
                  const response = await contract.mint(NFTAmountBN, {
                    value: mintValue
                  });
                  console.log('response', response);
                  setSuccessRedeemPopup(true); // Set success flag to display success message
                } else {
                  // Serial number is not valid, display an error or handle accordingly
                  console.log('Invalid serial number');
                  setInvalidSerialPopup(true);
                }
              } catch (err) {
                console.log('error', err);
              }
            }
          };

        const handleTransferRandomNFT = async () => {
            if (window.ethereum && isConnected) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(
                    edNFTsAddress.address,
                    edNFTs.abi,
                    signer
                );
                try {
                    // Check if the serial number exists in Firestore
                    const isSerialNumberValid = await checkSerialNumberInFirestore(serialNumber);
    
                    if (isSerialNumberValid) {
                        // Serial number is valid, proceed with transferring random NFT
                        const response = await contract.transferRandomNFT();
                        console.log('Transfer Random NFT response:', response);
                    } else {
                        // Serial number is not valid, display an error or handle accordingly
                        console.log('Invalid serial number');
                        // You can show a message to the user indicating that the serial number is invalid
                    }
                } catch (err) {
                    console.error('Error transferring random NFT:', err);
                }
            }
        };

    // Function to check if the serial number exists in Firestore
  const checkSerialNumberInFirestore = async (serialNumber) => {
    try {
      // Replace 'your-cloud-project-id' with the actual project ID of your Firestore Cloud project
      const firebaseConfig = {
        apiKey: "AIzaSyDIyj_3MsOXabfB2tDJCHbZ5UWNP0eorpk",
        authDomain: "serial-number-62043.firebaseapp.com",
        projectId: "serial-number-62043",
        storageBucket: "serial-number-62043.appspot.com",
        messagingSenderId: "748313570305",
        appId: "1:748313570305:web:6fb2eb79c8ddcc7b7ee400",
        measurementId: "G-E9TBVBCRFV"
      };
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      const serialNumbersCollection = collection(db, 'serial_numbers');
      const q = query(serialNumbersCollection, where('serial_number', '==', serialNumber));
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking serial number in Firestore:', error);
      return false;
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
        <div className="hero hero-background-cover">
            <div className="NFT-Exam">
                <img src={JarLogo} alt="Jar"></img>
            </div>
            <div className="NFT-Exam-Circle"> </div>
            
            
            <div className="hero-content">           
            <h2>Eden Verden x MysteryJars</h2>
            <div className="NFT-Exam-Container">
            <div className="text-column">
            <div className="supply-info">
            <p>Total Supply in this pool: {totalSupply} &nbsp;&nbsp; Remaining NFTs: {remainingSupply}</p>           
            <p className="EdenText-Container"> Put your serial number </p>
            </div>
            </div>
            <div className="input-container">
            <label htmlFor="serialNumber"></label>
            <input
            type="text"
            id="serialNumber"
            placeholder="Put in your s/n here: SN-123......"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            style={{ width: '500px',height: '50px', borderRadius: '20px', margin: '10px',border: '5px solid' }}
            />
      </div>
            </div>
            {isConnected ? (
                <div className="main-mint-section">                   
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
    );
};

export default MainMint;