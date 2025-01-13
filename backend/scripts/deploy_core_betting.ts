import { ethers } from "hardhat";

async function main() {
  // Get the contract factory

  const Verifier = await ethers.getContractFactory("Verifier");
  const verifier = await Verifier.deploy();
  // Wait for the deployment to complete
  await verifier.waitForDeployment();

  let verifierAddress = verifier.target;
  console.log(`verifier deployed to: ${verifierAddress}`);

  const LiquidityPoolContainer = await ethers.getContractFactory(
    "LiquidityPoolContainer"
  );
  // Deploy the contract
  const liquidityPoolContainer = await LiquidityPoolContainer.deploy(2, 10);
  // Wait for the deployment to complete
  await liquidityPoolContainer.waitForDeployment();
  let liquidityPoolAddress = liquidityPoolContainer.target;

  console.log(`LiquidityPool deployed to: ${liquidityPoolContainer.target}`);

  const Validator = await ethers.getContractFactory("Validator");
  const validator = await Validator.deploy();
  // Wait for the deployment to complete
  await validator.waitForDeployment();

  let validatorAddress = validator.target;
  console.log(`validator deployed to: ${validatorAddress}`);

  // Deploy the contract

  const CoreBetting = await ethers.getContractFactory("CoreBetting");
  const coreBetting = await CoreBetting.deploy(
    verifierAddress,
    liquidityPoolAddress,
    validatorAddress
  );

  // Wait for the deployment to complete
  await coreBetting.waitForDeployment();

  console.log(`coreBetting deployed to: ${coreBetting.target}`);
}

// Handle async/await errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
