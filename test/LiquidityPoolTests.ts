import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { LiquidityPool } from "../typechain-types"; // Adjust the path as needed

describe("LiquidityPool", function () {
    let LiquidityPoolFactory: LiquidityPool;
    let liquidityPool: LiquidityPool;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;

    beforeEach(async function () {
        // Get the contract factory and signers
        const LiquidityPoolContract = await ethers.getContractFactory("LiquidityPool");
        [owner, addr1, addr2] = await ethers.getSigners();
        console.log(`${owner.address}, ${addr1.address}, ${addr2.address}`);
        
        // Deploy the contract
        liquidityPool = (await LiquidityPoolContract.deploy(2, 10)) as LiquidityPool;
        await liquidityPool.waitForDeployment();

        console.log(`LiquidityPool deployed to: ${liquidityPool.target}`);


    });

    it("should allow a user to buy shares for all outcomes", async function () {
        const amount = ethers.parseEther("1");
        await liquidityPool.connect(addr1).buySharesForAllOutcomes({ value: amount });

        const totalLiquidity = await liquidityPool.totalLiquidity();
        expect(totalLiquidity).to.equal(amount);

        const userShares = await liquidityPool.userShares(addr1.address, 1); // Outcome1
        expect(userShares).to.be.gt(0);
    });

    it("should allow the owner to set an outcome", async function () {
        await liquidityPool.connect(owner).setOutcome(1); // Set to Outcome1
        const outcome = await liquidityPool.currentOutcome();
        expect(outcome).to.equal(1);
    });

    it("should allow users to redeem shares after outcome is set", async function () {
        const amount = ethers.parseEther("1");
        await liquidityPool.connect(addr1).buySharesForAllOutcomes({ value: amount });

        await liquidityPool.connect(owner).setOutcome(1); // Set to Outcome1

        const userInitialBalance = await ethers.provider.getBalance(addr1);
        const tx = await liquidityPool.connect(addr1).redeemShares();
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
        await liquidityPool.connect(addr1).buySharesForAllOutcomes({ value: amount });

        const userInitialBalance = await ethers.provider.getBalance(addr1);
        const tx = await liquidityPool.connect(addr1).withdrawLiquidity();
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
            liquidityPool.connect(addr1).withdrawLiquidity()
        ).to.be.revertedWith("No liquidity contributed");
    });

    it("should fail when a user tries to buy shares due to lack of liquidity", async function () {
        // Simulate a situation where the contract has no liquidity
        const initialLiquidity = await ethers.provider.getBalance(liquidityPool.target);
        expect(initialLiquidity).to.equal(0);

        // User (addr1) tries to buy shares but the contract has no liquidity
        await expect(
            liquidityPool.connect(addr1).buySharesForAllOutcomes({ value: ethers.parseEther("1") })
        ).to.be.revertedWith("Must send Ether to buy shares");

        // The contract still has no liquidity, and addr1's balance should remain unchanged
        const addr1BalanceBefore = await ethers.provider.getBalance(addr1);
        expect(await ethers.provider.getBalance(liquidityPool.address)).to.equal(0);
        expect(await ethers.provider.getBalance(addr1)).to.equal(addr1BalanceBefore);
    });

    it("should fail when user tries to redeem shares without the outcome being set", async function () {
        // User (addr1) buys shares for all outcomes
        await liquidityPool.connect(addr1).buySharesForAllOutcomes({ value: ethers.parseEther("1") });

        // addr1 attempts to redeem shares before outcome is set
        await expect(
            liquidityPool.connect(addr1).redeemShares()
        ).to.be.revertedWith("Outcome not set");
    });


});
