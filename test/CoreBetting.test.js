// test/CoreBetting.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CoreBetting", function () {
  let coreBetting;
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

    const coreBetting = await ethers.getContractFactory("CoreBetting");
    coreBetting = await coreBetting.deploy(
      bettingDeadline,
      oracleAddress,
      identifier,
      ancillaryData,
      rewardTokenAddress
    );
    await coreBetting.deployed();
  });

  it("Should allow placing bets", async function () {
    const betAmount = ethers.utils.parseEther("0.1");
    await coreBetting.connect(addr1).placeBet(0, { value: betAmount });

    const bet = await coreBetting.bets(addr1.address);
    expect(bet.amount).to.equal(betAmount);
    expect(bet.option).to.equal(0);
    expect(bet.claimed).to.equal(false);
  });

  it("Should not allow placing multiple bets", async function () {
    const betAmount = ethers.utils.parseEther("0.1");
    await coreBetting.connect(addr1).placeBet(0, { value: betAmount });

    await expect(
      coreBetting.connect(addr1).placeBet(1, { value: betAmount })
    ).to.be.revertedWith("You've already placed a bet");
  });

  it("Should not allow betting after deadline", async function () {
    await time.increase(86401); // Advance time past deadline

    const betAmount = ethers.utils.parseEther("0.1");
    await expect(
      coreBetting.connect(addr1).placeBet(0, { value: betAmount })
    ).to.be.revertedWith("Betting period is over");
  });

  it("Should not allow outcome request before deadline", async function () {
    await expect(coreBetting.requestOutcome()).to.be.revertedWith(
      "Action can only be performed after the betting deadline"
    );
  });
});
