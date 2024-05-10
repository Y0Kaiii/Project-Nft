//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract EdNFTs is ERC721, Ownable {
    
    mapping(uint256 => address) private nftOwners;
    uint256 public mintPrice;
    uint256 public totalSupply;
    uint256 public maxSupply;
    uint256 public maxPerWallet;
    bool public isPublicMintEnabled;
    string internal baseTokenUri;
    address payable public withdrawWallet;
    mapping(address => uint256) public walletMints;

    constructor() payable ERC721('EdNFT', 'EN'){
        mintPrice = 0.001 ether;
        totalSupply = 0;
        maxSupply = 20;
        maxPerWallet = 20;
        baseTokenUri = 'ipfs://QmUP3RgirskSWtJGEEgQpZzNUmjkpayua42H8GbtSxAQ9x/';
        //set withdraw wallet address
    }

    function setIsPublicMintEnabled(bool isPublicMintEnabled_) external onlyOwner{
        isPublicMintEnabled = isPublicMintEnabled_;
    }

    function updateMintPrice(uint256 newMintPrice) external onlyOwner {
        mintPrice = newMintPrice;
    }

    function updateMaxSupply(uint256 newMaxSupply) external onlyOwner {
        maxSupply = newMaxSupply;
    }

    function setBaseTokenUri(string calldata baseTokenUri_) external onlyOwner{
        baseTokenUri = baseTokenUri_;
    }

    function tokenURI(uint256 tokenId_) public view override returns (string memory){
        require(_exists(tokenId_), 'Token does not exist!');
        return string(abi.encodePacked(baseTokenUri,Strings.toString(tokenId_), ".json"));
    }

    function withdraw() external onlyOwner {
        (bool success, ) = withdrawWallet.call{ value: address(this).balance}('');
        require(success, 'withdraw failed');
    }

    function getMaxSupply() external view returns (uint256) {
        return maxSupply;
    }

    function getTotalSupply() external view returns (uint256) {
        return totalSupply;
    }

    function mint(uint256 quantity_) public payable {
        require(isPublicMintEnabled, 'minting not enabled');
        require(totalSupply + quantity_ <= maxSupply, 'sold out');
        require(walletMints[msg.sender] + quantity_ <= maxPerWallet, 'exceed max wallet');
        
        for (uint256 i = 0; i < quantity_; i++){
            uint256 newTokenId = totalSupply + 1;
            totalSupply++;
            _safeMint(msg.sender, newTokenId);
        }
    }

    function preMintSend(address to, uint256 quantity) external onlyOwner {
        require(totalSupply + quantity <= maxSupply, 'exceed max supply');
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 newTokenId = totalSupply + 1;
            totalSupply++;
            _safeMint(to, newTokenId);
            nftOwners[newTokenId] = to;
        }
    }

    function preMintNFTs(uint256 quantity) external onlyOwner {
        // Pre-mint 'quantity' number of NFTs and store them in the contract's inventory
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = totalSupply() + 1;
            _safeMint(address(this), tokenId);
            preMintedNFTs[tokenId] = address(this);
        }

    }

    function transferRandomNFT() external onlyOwner {
        uint256 randomTokenId = getRandomTokenId();
        
        // Ensure the selected token is not already owned by someone else
        require(nftOwners[randomTokenId] == address(0), "Token already owned");

        // Transfer the NFT to the specified address
        _transfer(address(this), msg.sender, randomTokenId);
        
        // Record the new owner of the NFT
        nftOwners[randomTokenId] = msg.sender;
    }

    // Function to generate a pseudo-random token ID
    function getRandomTokenId() private view returns (uint256) {
    // Use block variables to add randomness
    uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, block.number)));
    
    // Use modulo to limit the range of the random number to the total supply of tokens
    return (randomNumber % totalSupply) + 1;
}
}