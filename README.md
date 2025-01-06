<!-- # Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
``` -->
1. Setup the development environment
```shell
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts @uma/core dotenv
npx hardhat init
```
2. Get Sepolia testnet 
3. Configure the .env file
4. Deploy the contract
```shell
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```



# Alexandru Visarion's readme
Clean:
npm install
npx hardhat clean
Compile:
npx hardhat compile

Local test:
npx hardhat node


Run contract:
source .env
npx hardhat run scripts/deploy_liquidity_pool.ts --network polygonAmoy

Run tesst:
npx hardhat test

