import { ethers } from "hardhat";

async function main() {
  // Get the contract factory
  const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
  // Deploy the contract
  const liquidityPool = await LiquidityPool.deploy(2, 10);


  // Wait for the deployment to complete
  await liquidityPool.waitForDeployment();


  console.log(`LiquidityPool deployed to: ${liquidityPool.target}`);

}

// Handle async/await errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});