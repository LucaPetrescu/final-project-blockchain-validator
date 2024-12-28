const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  const HelloWord = await hre.ethers.getContractFactory("HelloWorld");
  const helloWorld = await HelloWord.deploy("Hello, Local World");

  await helloWorld.waitForDeployment();

  console.log(`HelloWorld deployed to: ${helloWorld.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
