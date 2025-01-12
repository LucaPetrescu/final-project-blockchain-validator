const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  const CoreBetting = await hre.ethers.getContractFactory("CoreBetting");
  const coreBetting = await CoreBetting.deploy();

  await coreBetting.waitForDeployment();

  console.log(`CoreBetting deployed to: ${coreBetting.target}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
