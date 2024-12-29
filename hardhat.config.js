require('dotenv').config();
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.0" },
      { version: "0.8.9" },
    ],
  },
  networks: {
    sepolia: {
      url: process.env.ETH_RPC_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },    
  },
};
