import { CoreBetting, Verifier, Validator, LiquidityPool, MockVerifier } from "../typechain-types";

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CoreBetting", function () {
  let liquidityPool: LiquidityPool;

  let  coreBetting: CoreBetting;
  let mockVerifier:MockVerifier;
  let validator:Validator;
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
      

    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    // Deploy the contract
    liquidityPool = await LiquidityPool.deploy(2, 10);
    // Wait for the deployment to complete
    await liquidityPool.waitForDeployment();
    let liquidityPoolAddress = liquidityPool.target;

    console.log(`LiquidityPool deployed to: ${liquidityPool.target}`);

    const Validator = await ethers.getContractFactory("Validator");
    validator = await Validator.deploy();
    // Wait for the deployment to complete
    await validator.waitForDeployment();

    let validatorAddress = validator.target;
    console.log(`validator deployed to: ${validatorAddress}`);

    // Deploy the contract

    const CoreBetting = await ethers.getContractFactory("CoreBetting");
    coreBetting = await CoreBetting.deploy(verifierAddress, liquidityPoolAddress, validatorAddress);


    // Wait for the deployment to complete
    await coreBetting.waitForDeployment();


    console.log(`coreBetting deployed to: ${coreBetting.target}`);
  });

  it("Should successfully create a market with valid inputs", async function () {
    const description = "Will team A win?";
    const resolutionTimestamp = (await ethers.provider.getBlock("latest")).timestamp + 3600; // 1 hour later
    const proof = [[1, 2], [[3, 4], [5, 6]], [7, 8], [9]]; // Dummy proof inputs

    await expect(coreBetting.createMarket(description, resolutionTimestamp, ...proof))
      .to.emit(coreBetting, "MarketCreated")
      .withArgs(0, description, resolutionTimestamp);

    const market = await coreBetting.markets(0);
    expect(market.description).to.equal(description);
    expect(market.resolutionTimestamp).to.equal(resolutionTimestamp);
  });

  /*
  it("Should allow creating a bet", async function () {
    const amount = ethers.parseEther("100");
    const eventId = "event123";
    const prediction = true;

    const tx = await coreBetting.connect(user1).createBet(eventId, 1);
    const receipt = await tx.wait();
    console.log(receipt)

    const betCreatedEvent = receipt.events.find(e => e.event === "BetCreated");
    expect(betCreatedEvent).to.exist;

    const betId = betCreatedEvent.args.betId;
    const betDetails = await coreBetting.getBetDetails(betId);

    expect(betDetails.eventId).to.equal(eventId);
    expect(betDetails.creator).to.equal(user1.address);
    expect(betDetails.amount).to.equal(amount);
    expect(betDetails.creatorPrediction).to.equal(prediction);
    expect(betDetails.state).to.equal(0); // Created state
  });

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
