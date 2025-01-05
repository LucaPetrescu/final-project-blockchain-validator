async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
  
    // Deploy parameters
    const bettingDeadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
    const oracleAddress = "0x263351499f82C107e540B01F0Ca959843e22464a"; // Sepolia UMA Oracle V2, apparently theres v3 now, might be deprecated: https://sepolia.etherscan.io/address/0xFd9e2642a170aDD10F53Ee14a93FcF2F31924944
    const identifier = ethers.utils.formatBytes32String("YES_OR_NO_QUERY");
    const ancillaryData = ethers.utils.defaultAbiCoder.encode(
      ["string"],
      ["Did team A win the match?"]
    );
    // On Sepolia, you can use WETH as reward token for testing
    const rewardTokenAddress = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9"; // Sepolia WETH
  
    const BettingContract = await ethers.getContractFactory("BettingContract");
    const betting = await BettingContract.deploy(
      bettingDeadline,
      oracleAddress,
      identifier,
      ancillaryData,
      rewardTokenAddress
    );
  
    await betting.deployed();
    console.log("BettingContract deployed to:", betting.address);
  
    // Wait for a few block confirmations
    await betting.deployTransaction.wait(6);
  
    // Verify the contract
    console.log("Verifying contract...");
    try {
      await run("verify:verify", {
        address: betting.address,
        constructorArguments: [
          bettingDeadline,
          oracleAddress,
          identifier,
          ancillaryData,
          rewardTokenAddress
        ],
      });
    } catch (error) {
      console.error("Error verifying contract:", error);
    }
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  
  // test/BettingContract.test.js
  const { expect } = require("chai");
  const { ethers } = require("hardhat");
  const { time } = require("@nomicfoundation/hardhat-network-helpers");
  
  describe("BettingContract", function () {
    let bettingContract;
    let owner;
    let addr1;
    let addr2;
    
    beforeEach(async function () {
      [owner, addr1, addr2] = await ethers.getSigners();
      
      const bettingDeadline = (await time.latest()) + 86400;
      const oracleAddress = "0x263351499f82C107e540B01F0Ca959843e22464a";
      const identifier = ethers.utils.formatBytes32String("YES_OR_NO_QUERY");
      const ancillaryData = ethers.utils.defaultAbiCoder.encode(
        ["string"],
        ["Did team A win the match?"]
      );
      const rewardTokenAddress = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
      
      const BettingContract = await ethers.getContractFactory("BettingContract");
      bettingContract = await BettingContract.deploy(
        bettingDeadline,
        oracleAddress,
        identifier,
        ancillaryData,
        rewardTokenAddress
      );
      await bettingContract.deployed();
    });
  
    it("Should allow placing bets", async function () {
      const betAmount = ethers.utils.parseEther("0.1");
      await bettingContract.connect(addr1).placeBet(0, { value: betAmount });
      
      const bet = await bettingContract.bets(addr1.address);
      expect(bet.amount).to.equal(betAmount);
      expect(bet.option).to.equal(0);
      expect(bet.claimed).to.equal(false);
    });
  
    it("Should not allow placing multiple bets", async function () {
      const betAmount = ethers.utils.parseEther("0.1");
      await bettingContract.connect(addr1).placeBet(0, { value: betAmount });
      
      await expect(
        bettingContract.connect(addr1).placeBet(1, { value: betAmount })
      ).to.be.revertedWith("You've already placed a bet");
    });
  
    it("Should not allow betting after deadline", async function () {
      await time.increase(86401); // Advance time past deadline
      
      const betAmount = ethers.utils.parseEther("0.1");
      await expect(
        bettingContract.connect(addr1).placeBet(0, { value: betAmount })
      ).to.be.revertedWith("Betting period is over");
    });
  
    it("Should not allow outcome request before deadline", async function () {
      await expect(
        bettingContract.requestOutcome()
      ).to.be.revertedWith("Action can only be performed after the betting deadline");
    });
  });