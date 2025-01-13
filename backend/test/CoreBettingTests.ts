import {
  CoreBetting,
  Verifier,
  Validator,
  LiquidityPoolContainer,
  MockVerifier,
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CoreBetting", function () {
  let liquidityPoolContainer: LiquidityPoolContainer;

  let coreBetting: CoreBetting;
  let mockVerifier: MockVerifier;
  let validator: Validator;
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
    liquidityPoolContainer = await LiquidityPoolContainer.deploy(2, 10);
    // Wait for the deployment to complete
    await liquidityPoolContainer.waitForDeployment();
    let liquidityPoolContainerAddress = liquidityPoolContainer.target;

    console.log(
      `LiquidityPoolContainer deployed to: ${liquidityPoolContainer.target}`
    );

    const Validator = await ethers.getContractFactory("Validator");
    validator = await Validator.deploy();
    // Wait for the deployment to complete
    await validator.waitForDeployment();

    let validatorAddress = validator.target;
    console.log(`validator deployed to: ${validatorAddress}`);

    // Deploy the contract

    const CoreBetting = await ethers.getContractFactory("CoreBetting");
    coreBetting = await CoreBetting.deploy(
      verifierAddress,
      liquidityPoolContainerAddress,
      validatorAddress
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
      const deadline =
        (await ethers.provider.getBlock("latest")).timestamp + 7200;
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

      await expect(
        coreBetting.createMarket(
          description,
          resolutionTimestamp,
          deadline,
          ...proof
        )
      )
        .to.emit(coreBetting, "MarketCreated")
        .withArgs(0, description, resolutionTimestamp, deadline);

      const market = await coreBetting.getMarket(0);
      expect(market.description).to.equal(description);
      expect(market.resolutionTimestamp).to.equal(resolutionTimestamp);
    });

    it("Should successfully two markets with valid inputs", async function () {
      const description = "Will team A win?";
      const resolutionTimestamp =
        (await ethers.provider.getBlock("latest")).timestamp + 3600; // 1 hour later
      const deadline =
        (await ethers.provider.getBlock("latest")).timestamp + 7200;
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

      await expect(
        coreBetting.createMarket(
          description,
          resolutionTimestamp,
          deadline,
          ...proof
        )
      )
        .to.emit(coreBetting, "MarketCreated")
        .withArgs(0, description, resolutionTimestamp, deadline);

      const market = await coreBetting.getMarket(0);
      expect(market.description).to.equal(description);
      expect(market.resolutionTimestamp).to.equal(resolutionTimestamp);

      const description2 = "Will team B win?";
      mockVerifier.setMockResult(true);

      await expect(
        coreBetting.createMarket(
          description2,
          resolutionTimestamp,
          deadline,
          ...proof
        )
      )
        .to.emit(coreBetting, "MarketCreated")
        .withArgs(1, description2, resolutionTimestamp, deadline);

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

    it("Should fail when creating a market with invalid inputs", async function () {
      const description = "Will team A win?";
      const resolutionTimestamp =
        (await ethers.provider.getBlock("latest")).timestamp + 3600; // 1 hour later
      const deadline =
        (await ethers.provider.getBlock("latest")).timestamp + 7200;
      const proof = [
        [1, 2],
        [
          [3, 4],
          [5, 6],
        ],
        [7, 8],
        [9],
      ]; // Dummy proof inputs

      mockVerifier.setMockResult(false);

      await expect(
        coreBetting.createMarket(
          description,
          resolutionTimestamp,
          deadline,
          ...proof
        )
      ).to.be.revertedWith("Invalid proof");
    });

    it("Fetch market successful", async function () {
      const description = "Will team A win?";
      const resolutionTimestamp =
        (await ethers.provider.getBlock("latest")).timestamp + 3600; // 1 hour later
      const deadline =
        (await ethers.provider.getBlock("latest")).timestamp + 7200;
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

      await expect(
        coreBetting.createMarket(
          description,
          resolutionTimestamp,
          deadline,
          ...proof
        )
      )
        .to.emit(coreBetting, "MarketCreated")
        .withArgs(0, description, resolutionTimestamp, deadline);

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
      const deadline =
        (await ethers.provider.getBlock("latest")).timestamp + 7200;
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

      await expect(
        coreBetting.createMarket(
          description,
          resolutionTimestamp,
          deadline,
          ...proof
        )
      )
        .to.emit(coreBetting, "MarketCreated")
        .withArgs(0, description, resolutionTimestamp, deadline);

      const eventId1 = "event123";

      const tx = await expect(coreBetting.connect(user1).createBet(eventId1, 0))
        .to.emit(coreBetting, "BetCreated")
        .withArgs(0, eventId1);
    });

    it("Should allow creating two bets", async function () {
      const description = "Will team A win?";
      const resolutionTimestamp =
        (await ethers.provider.getBlock("latest")).timestamp + 3600; // 1 hour later
      const deadline =
        (await ethers.provider.getBlock("latest")).timestamp + 7200;
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

      await expect(
        coreBetting.createMarket(
          description,
          resolutionTimestamp,
          deadline,
          ...proof
        )
      )
        .to.emit(coreBetting, "MarketCreated")
        .withArgs(0, description, resolutionTimestamp, deadline);

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

  /*
  it("Should allow taking a position", async function () {
    const betId = await setupBet();

    const entryPrice = ethers.parseEther("50");
    await pool.setEntryPrice(betId, entryPrice);

    await expect(coreBetting.connect(user2).takePosition(betId, false))
      .to.emit(coreBetting, "PositionTaken")
      .withArgs(betId, user2.address, entryPrice, false, entryPrice);

    const betDetails = await coreBetting.getBetDetails(betId);
    expect(betDetails.totalPool).to.equal(ethers.parseEther("150"));
  });

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
