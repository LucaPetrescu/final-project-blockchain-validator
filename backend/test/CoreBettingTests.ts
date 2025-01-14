import {
  CoreBetting,
  Verifier,
  Oracle,
  LiquidityPoolContainer,
  MockVerifier,
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network } from "hardhat";

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CoreBetting", function () {
  let liquidityPoolContainer: LiquidityPoolContainer;

  let coreBetting: CoreBetting;
  let mockVerifier: MockVerifier;
  let oracle: Oracle;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    const MockVerifier = await ethers.getContractFactory("MockVerifier");
    mockVerifier = await MockVerifier.deploy();
    // Wait for the deployment to complete
    await mockVerifier.waitForDeployment();
    [owner, user1, user2] = await ethers.getSigners();

    let verifierAddress = mockVerifier.target;
    console.log(`verifier deployed to: ${verifierAddress}`);

    const LiquidityPoolContainer = await ethers.getContractFactory(
      "LiquidityPoolContainer"
    );
    // Deploy the contract
    liquidityPoolContainer = await LiquidityPoolContainer.deploy();
    // Wait for the deployment to complete
    await liquidityPoolContainer.waitForDeployment();
    let liquidityPoolContainerAddress = liquidityPoolContainer.target;

    console.log(
      `LiquidityPoolContainer deployed to: ${liquidityPoolContainer.target}`
    );

    const Oracle = await ethers.getContractFactory("Oracle");
    
    oracle = await Oracle.deploy(2);
    // Wait for the deployment to complete
    await oracle.waitForDeployment();

    let oracleAddress = oracle.target;
    console.log(`oracle deployed to: ${oracleAddress}`);

    // Deploy the contract

    const CoreBetting = await ethers.getContractFactory("CoreBetting");
    coreBetting = await CoreBetting.deploy(
      verifierAddress,
      liquidityPoolContainerAddress,
      oracleAddress
    );

    // Wait for the deployment to complete
    await coreBetting.waitForDeployment();

    console.log(`coreBetting deployed to: ${coreBetting.target}`);
  });

  describe("createMarket", function () {
    it("Should successfully create a market with valid inputs", async function () {
      const description = "Will team A win?";
      const resolutionTimestamp =
        (await ethers.provider.getBlock("latest")).timestamp + 3600; // 1 hour later

      const proof = [
        [1, 2],
        [
          [3, 4],
          [5, 6],
        ],
        [7, 8],
        [9],
      ]; // Dummy proof inputs
      mockVerifier.setMockResult(true);

      await expect(coreBetting.createMarket(description, resolutionTimestamp))
        .to.emit(coreBetting, "MarketCreated")
        .withArgs(0, description, resolutionTimestamp);

      const market = await coreBetting.getMarket(0);
      expect(market.description).to.equal(description);
      expect(market.resolutionTimestamp).to.equal(resolutionTimestamp);
    });

    it("Should successfully two markets with valid inputs", async function () {
      const description = "Will team A win?";
      const resolutionTimestamp =
        (await ethers.provider.getBlock("latest")).timestamp + 3600; // 1 hour later

      const proof = [
        [1, 2],
        [
          [3, 4],
          [5, 6],
        ],
        [7, 8],
        [9],
      ]; // Dummy proof inputs
      mockVerifier.setMockResult(true);

      await expect(coreBetting.createMarket(description, resolutionTimestamp))
        .to.emit(coreBetting, "MarketCreated")
        .withArgs(0, description, resolutionTimestamp);

      const market = await coreBetting.getMarket(0);
      expect(market.description).to.equal(description);
      expect(market.resolutionTimestamp).to.equal(resolutionTimestamp);

      const description2 = "Will team B win?";
      mockVerifier.setMockResult(true);

      await expect(coreBetting.createMarket(description2, resolutionTimestamp))
        .to.emit(coreBetting, "MarketCreated")
        .withArgs(1, description2, resolutionTimestamp);

      const market2 = await coreBetting.getMarket(1);
      expect(market2.description).to.equal(description2);
      expect(market2.resolutionTimestamp).to.equal(resolutionTimestamp);

      const markets = await coreBetting.getMarkets();
      expect(markets.length, 2);

      const market0 = markets[0];
      expect(market0.description).to.equal(description);
      expect(market0.resolutionTimestamp).to.equal(resolutionTimestamp);

      const market1 = markets[1];
      expect(market1.description).to.equal(description2);
      expect(market1.resolutionTimestamp).to.equal(resolutionTimestamp);
    });

    it("Fetch market successful", async function () {
      const description = "Will team A win?";
      const resolutionTimestamp =
        (await ethers.provider.getBlock("latest")).timestamp + 3600; // 1 hour later

      const proof = [
        [1, 2],
        [
          [3, 4],
          [5, 6],
        ],
        [7, 8],
        [9],
      ]; // Dummy proof inputs
      mockVerifier.setMockResult(true);

      await expect(coreBetting.createMarket(description, resolutionTimestamp))
        .to.emit(coreBetting, "MarketCreated")
        .withArgs(0, description, resolutionTimestamp);

      const market = await coreBetting.getMarket(0);
      expect(market.description).to.equal(description);
      expect(market.resolutionTimestamp).to.equal(resolutionTimestamp);
    });

    it("Should not return the correct Market struct", async function () {
      const marketId = 1;

      // Call the getMarket function
      const market = await expect(
        coreBetting.getMarket(marketId)
      ).to.be.revertedWith("Invalid ID");
    });
  });

  describe("createBet", function () {
    it("Should not allow creating a bet", async function () {
      const eventId = "event123";

      const tx = await expect(
        coreBetting.connect(user1).createBet(eventId, 2)
      ).to.be.revertedWith("Invalid ID");
    });

    it("Should allow creating a bet", async function () {
      const description = "Will team A win?";
      const resolutionTimestamp =
        (await ethers.provider.getBlock("latest")).timestamp + 3600; // 1 hour later

      const proof = [
        [1, 2],
        [
          [3, 4],
          [5, 6],
        ],
        [7, 8],
        [9],
      ]; // Dummy proof inputs
      mockVerifier.setMockResult(true);

      await expect(coreBetting.createMarket(description, resolutionTimestamp))
        .to.emit(coreBetting, "MarketCreated")
        .withArgs(0, description, resolutionTimestamp);

      const eventId1 = "event123";

      const tx = await expect(coreBetting.connect(user1).createBet(eventId1, 0))
        .to.emit(coreBetting, "BetCreated")
        .withArgs(0, eventId1);
    });

    it("Should allow creating two bets", async function () {
      const description = "Will team A win?";
      const resolutionTimestamp =
        (await ethers.provider.getBlock("latest")).timestamp + 3600; // 1 hour later

      const proof = [
        [1, 2],
        [
          [3, 4],
          [5, 6],
        ],
        [7, 8],
        [9],
      ]; // Dummy proof inputs
      mockVerifier.setMockResult(true);

      await expect(coreBetting.createMarket(description, resolutionTimestamp))
        .to.emit(coreBetting, "MarketCreated")
        .withArgs(0, description, resolutionTimestamp);

      const eventId1 = "event123";
      const eventId2 = "event456";

      const tx = await expect(coreBetting.connect(user1).createBet(eventId1, 0))
        .to.emit(coreBetting, "BetCreated")
        .withArgs(0, eventId1);
      const tx2 = await expect(
        coreBetting.connect(user1).createBet(eventId2, 0)
      )
        .to.emit(coreBetting, "BetCreated")
        .withArgs(1, eventId2);
      const marketBets = await coreBetting.getMarketBets(0);
      expect(marketBets.length, 2);

      expect(marketBets[0].description, eventId1);
      expect(marketBets[1].description, eventId2);
    });
  });

  it("Should allow a user to place a bet with ETH", async function () {
    const nineEthInWeiHex = ethers.toQuantity(ethers.parseEther("10"));

    await network.provider.send("hardhat_setBalance", [
      user1.address,
      nineEthInWeiHex
    ]);

    // Create a market
    const resolutionTime = Math.floor(Date.now() / 1000) + 3600;
    await coreBetting.createMarket("Market #1", resolutionTime);

    // Create a bet in that market
    await coreBetting.createBet("Bet #1", 0);

    // Place a bet from user1
    await expect(
      coreBetting.connect(user1).placeBet(0, 0, true, {
        value: ethers.parseEther("9"),
      })
    )
      .to.emit(coreBetting, "BetPlaced")
      .withArgs(0, user1.address, ethers.parseEther("9"), true);

      const contractBalance = await ethers.provider.getBalance(liquidityPoolContainer.target);
      expect(ethers.formatEther(contractBalance) == ethers.parseEther("9") );
  });

  it("Should allow a user to create liquidity", async function () {
    const nineEthInWeiHex = ethers.toQuantity(ethers.parseEther("10"));

    await network.provider.send("hardhat_setBalance", [
      user1.address,
      nineEthInWeiHex
    ]);

    // Create a market
    const resolutionTime = Math.floor(Date.now() / 1000) + 3600;
    await coreBetting.createMarket("Market #1", resolutionTime);

    // Create a bet in that market
    await coreBetting.createBet("Bet #1", 0);

    // Place a bet from user1
    await expect(
      coreBetting.connect(user1).addLiquidity(0, 0, {
        value: ethers.parseEther("9"),
      })
    )
      .to.emit(coreBetting, "LiquidityCreated")
      .withArgs(0, 0, user1.address, ethers.parseEther("9"));

      const contractBalance = await ethers.provider.getBalance(liquidityPoolContainer.target);
      expect(ethers.formatEther(contractBalance) == ethers.parseEther("9") );
  });
/*
  it("Should settle a bet correctly", async function () {
    const betId = await setupBet();
    await coreBetting.connect(user2).takePosition(betId, false);

    await oracle.setOutcome(betId, true); // Oracle resolves the event as true
    await coreBetting.connect(owner).settleBet(betId);

    const betDetails = await coreBetting.getBetDetails(betId);
    expect(betDetails.state).to.equal(2); // Settled state
  });

  it("Should cancel a bet and refund participants", async function () {
    const betId = await setupBet();
    await coreBetting.connect(user2).takePosition(betId, false);

    await expect(coreBetting.connect(user1).cancelBet(betId))
      .to.emit(coreBetting, "BetCancelled")
      .withArgs(betId);

    const betDetails = await coreBetting.getBetDetails(betId);
    expect(betDetails.state).to.equal(3); // Cancelled state

    const user1Balance = await token.balanceOf(user1.address);
    const user2Balance = await token.balanceOf(user2.address);
    expect(user1Balance).to.equal(ethers.parseEther("1000"));
    expect(user2Balance).to.equal(ethers.parseEther("1000"));
  });

  it("Should not allow settling a bet before it is active", async function () {
    const betId = await setupBet();
    await expect(coreBetting.connect(owner).settleBet(betId)).to.be.revertedWith("Bet not active");
  });

  it("Should only allow the creator to cancel a bet", async function () {
    const betId = await setupBet();
    await expect(coreBetting.connect(user2).cancelBet(betId)).to.be.revertedWith("Not creator");
  });

  async function setupBet() {
    const amount = ethers.parseEther("100");
    const eventId = "event123";
    const prediction = true;

    const tx = await coreBetting.connect(user1).createBet(eventId, amount, prediction);
    const receipt = await tx.wait();

    const betCreatedEvent = receipt.events.find(e => e.event === "BetCreated");
    return betCreatedEvent.args.betId;
  }
  */
});
