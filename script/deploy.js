const { ethers } = require("hardhat");

async function main() {
  const ReliefFund = await ethers.getContractFactory("ReliefFund");
  const reliefFund = await ReliefFund.deploy();

  await reliefFund.deployed();
  console.log("ReliefFund contract deployed to:", reliefFund.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });