const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  const HelloWord = await ethers.getContractFactory("HelloWorld");
  const helloWorld = await HelloWord.deploy("Hello, Local World");

  await helloWorld.waitForDeployment();

  console.log(`HelloWorld deployed to: ${helloWorld.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
