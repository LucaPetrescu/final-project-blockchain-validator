import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { LiquidityPoolContainer
 } from "../typechain-types"; // Adjust the path as needed

describe("LiquidityPoolContainer", function () {
    let LiquidityPoolContainerFactory: LiquidityPoolContainer;
    let liquidityPoolContainer: LiquidityPoolContainer;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;

    let testKey = "0:0";

    beforeEach(async function () {
        // Get the contract factory and signers
        const LiquidityPoolContainerContract = await ethers.getContractFactory("LiquidityPoolContainer");
        [owner, addr1, addr2] = await ethers.getSigners();
        console.log(`${owner.address}, ${addr1.address}, ${addr2.address}`);
        
        // Deploy the contract
        liquidityPoolContainer = (await LiquidityPoolContainerContract.deploy(2, 10)) as LiquidityPoolContainer;
        await liquidityPoolContainer.waitForDeployment();

        console.log(`LiquidityPoolContainer deployed to: ${liquidityPoolContainer.target}`);


    });

    it("should allow a user to buy shares for all outcomes", async function () {
        const amount = ethers.parseEther("1");
        await liquidityPoolContainer.connect(addr1).buySharesForAllOutcomes(testKey, { value: amount });

        const totalLiquidity = await liquidityPoolContainer.getTotalLiquidity(testKey);
        expect(totalLiquidity).to.equal(amount);

        const userShares = await liquidityPoolContainer.getUserShares(testKey, addr1.address, 1); // Outcome1
        expect(userShares).to.be.gt(0);
    });

    it("should allow the owner to set an outcome", async function () {
        await liquidityPoolContainer.connect(owner).setOutcome(1); // Set to Outcome1
        const outcome = await liquidityPoolContainer.currentOutcome();
        expect(outcome).to.equal(1);
    });

    it("should allow users to redeem shares after outcome is set", async function () {
        const amount = ethers.parseEther("1");
        await liquidityPoolContainer.connect(addr1).buySharesForAllOutcomes(testKey, { value: amount });

        await liquidityPoolContainer.connect(owner).setOutcome(1); // Set to Outcome1

        const userInitialBalance = await ethers.provider.getBalance(addr1);
        const tx = await liquidityPoolContainer.connect(addr1).redeemShares(testKey);
        const receipt = await tx.wait();


        const gasUsed = BigInt(receipt.gasUsed);
        console.log(typeof receipt.gasUsed); // Should output 'object' if it's a BigNumber

        const gasPrice = BigInt(receipt?.gasPrice)
        const gasCost = gasUsed * gasPrice;

        const userFinalBalance = await ethers.provider.getBalance(addr1);
        expect(userFinalBalance + gasCost).to.be.gt(userInitialBalance);
    });

    it("should allow liquidity providers to withdraw their liquidity", async function () {
        const amount = ethers.parseEther("1");
        await liquidityPoolContainer.connect(addr1).buySharesForAllOutcomes(testKey, { value: amount });

        const userInitialBalance = await ethers.provider.getBalance(addr1);
        const tx = await liquidityPoolContainer.connect(addr1).withdrawLiquidity(testKey);
        const receipt = await tx.wait();

        const gasUsed = BigInt(receipt.gasUsed);
        const gasPrice = BigInt(receipt.gasPrice);
        const gasCost = gasUsed * gasPrice;

        const userFinalBalance = await ethers.provider.getBalance(addr1);
        expect(userFinalBalance + gasCost).to.be.gt(userInitialBalance);
    });

    it("should fail when a user tries to withdraw liquidity but hasn't contributed any", async function () {
        // User (addr1) hasn't contributed any liquidity
        await expect(
            liquidityPoolContainer.connect(addr1).withdrawLiquidity(testKey)
        ).to.be.revertedWith("No liquidity contributed");
    });



    it("should fail when user tries to redeem shares without the outcome being set", async function () {
        // User (addr1) buys shares for all outcomes
        await liquidityPoolContainer.connect(addr1).buySharesForAllOutcomes(testKey, { value: ethers.parseEther("1") });

        // addr1 attempts to redeem shares before outcome is set
        await expect(
            liquidityPoolContainer.connect(addr1).redeemShares(testKey)
        ).to.be.revertedWith("Outcome not set");
    });


});
