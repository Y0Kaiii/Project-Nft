import React, { useState } from 'react';
import axios from 'axios';

const NFTUpload = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [pinataApiKey, setPinataApiKey] = useState('1414464b6a68df3c4f10');
    const [pinataSecretApiKey, setPinataSecretApiKey] = useState('2bb92479b81d262f98823a3a7c626047aac71b600c5565646250ed87e41cf373');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [metadataUrls, setMetadataUrls] = useState([]);
    const [nftFolderCid, setNftFolderCid] = useState(''); // Store NFT folder CID
    const [MetaCid, setMetaCid] = useState('');
    const rootFolderName = 'nfts'; // Root folder for images
    const metadataFolderName = 'metadata'; // Root folder for metadata
  
    // Handle file selection (multiple files)
    const handleFileChange = (e) => {
      setSelectedFiles(e.target.files);
    };
  
    // Upload multiple images to IPFS
    const uploadFilesToIPFS = async (files) => {
      const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
      const formData = new FormData();
  
      // Append each selected file to the FormData under the 'nfts' folder
      Array.from(files).forEach(file => {
        formData.append('file', file, `${rootFolderName}/${file.name}`);
      });
  
      try {
        const res = await axios.post(url, formData, {
          headers: {
            'Content-Type': `multipart/form-data`,
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey,
          },
        });
  
        const folderCid = res.data.IpfsHash;
        setNftFolderCid(folderCid); // Store the CID for later use

      // Return the folder CID URL
        const folderUrl = `https://gateway.pinata.cloud/ipfs/${folderCid}`;
        return folderUrl;
    
      } catch (err) {
        console.error('Error uploading files to IPFS:', err);
        throw err;
      }
    };
  
    // Upload JSON metadata to IPFS under a single folder
    const uploadMetadataToIPFS = async (metadataArray) => {
      const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
      const formData = new FormData();
  
      // Append each metadata file to the FormData under the 'metadata' folder
      metadataArray.forEach((metadata, index) => {
        const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
        const fileName = `${index + 1}.json`; // Name the metadata files based on index or file name
        formData.append('file', metadataBlob, `${metadataFolderName}/${fileName}`);
      });
  
      try {
        const res = await axios.post(url, formData, {
          headers: {
            'Content-Type': `multipart/form-data`,
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey,
          },
        });
        const MetaCid = res.data.IpfsHash;
        setMetaCid(MetaCid); // Store the CID for later use
        // Return the folder CID
        return res.data.IpfsHash;
      } catch (err) {
        console.error('Error uploading metadata to IPFS:', err);
        throw err;
      }
    };
  
    // Create NFT metadata for each image
    const createMetadata = (imageIpfsUrl, fileName) => {
      return {
        name: fileName.split('.')[0],  // Get the ID from the file name (e.g., 1.png -> 1)
        description: `Description for ${fileName}`,
        image: imageIpfsUrl,
        attributes: [
          {
            trait_type: 'Background',
            value: 'Blue',
          },
          {
            trait_type: 'Rarity',
            value: 'Rare',
          },
        ],
      };
    };
  
    // Handle bulk file upload
    const handleBulkUpload = async (e) => {
      e.preventDefault();
      let uploaded = [];
      let metadataArray = [];
  
      try {
        // Upload all images in one go and get the folder CID
        const folderUrl = await uploadFilesToIPFS(selectedFiles);
  
        for (let i = 0; i < selectedFiles.length; i++) {
            const fileName = selectedFiles[i].name;
          const imageIpfsUrl = `${folderUrl}/${fileName}`;
  
          uploaded.push({ fileName: fileName, url: imageIpfsUrl });
  
          // Create metadata for each image
          const metadata = createMetadata(imageIpfsUrl, fileName);
          metadataArray.push(metadata);  // Add each metadata to the array
        }
  
        // Upload all metadata to IPFS in one go and get the folder CID
        const metadataFolderCID = await uploadMetadataToIPFS(metadataArray);
  
        // Update state with image and metadata info
        setUploadedFiles(uploaded);
        setMetadataUrls(metadataArray.map((metadata, index) => ({
          nftId: index + 1,
          metadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataFolderCID}/${index + 1}.json`
        })));
  
        // Optional: Download metadata links
        downloadMetadataUrls(metadataArray, metadataFolderCID);
      } catch (error) {
        console.error('Failed to upload NFTs:', error);
      }
    };
  
    // Function to create and download the txt file with metadata URLs
    const downloadMetadataUrls = (metadataArray, folderCID) => {
      const element = document.createElement("a");
      const fileContent = metadataArray.map((metadata, index) => `NFT #${index + 1}: https://gateway.pinata.cloud/ipfs/${folderCID}/${index + 1}.json`).join("\n");
      const file = new Blob([fileContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = "metadata_urls.txt";
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
    };
  
    return (
      <div>
        <h2 style={{ color: 'Black',justifyContent: 'center', alignItems: 'center', display: 'flex' }}>Bulk Upload NFTs</h2>
        <form onSubmit={handleBulkUpload}>
          <div>
            <label htmlFor="file">Select NFT PNG Files:</label>
            <input type="file" onChange={handleFileChange} accept="image/png" multiple required />
          </div>
          <button type="submit">Upload NFTs</button>
        </form>
  
        {uploadedFiles.length > 0 && (
          <div>
            <h3>Uploaded Images:</h3>
            <ul>
              {uploadedFiles.map((file, index) => (
                <li key={index}>
                  {file.fileName}: <a href={file.url} target="_blank" rel="noopener noreferrer">{file.url}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
  
        {metadataUrls.length > 0 && (
          <div>
            <h3>Uploaded Metadata:</h3>
            <ul>
              {metadataUrls.map((data, index) => (
                <li key={index}>
                  NFT #{data.nftId}: <a href={data.metadataUrl} target="_blank" rel="noopener noreferrer">{data.metadataUrl}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  export default NFTUpload;