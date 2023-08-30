
const hre = require("hardhat");

async function main() {
  
  const EdNFTs = await hre.ethers.getContractFactory("EdNFTs");
  const edNFTs = await EdNFTs.deploy();

  await edNFTs.deployed();

  console.log("EdNFTs deployed to:", edNFTs.address);
  saveAddress(edNFTs, "EdNFTs");

}

function saveAddress(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );

}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
