// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
import "./structs/LiquidityPool.sol";


contract LiquidityPoolContainer is ERC20, Ownable {
    // Key is "<market_id>:<bet_id>""
    mapping(string => LiquidityPool) private liquidityPools;

    Outcome public currentOutcome;  // The outcome of the event (set by the owner)


    uint256 private scalingFactor = 1000000000000000000;


    // Tracks the amount of shares bought per outcome
    //mapping(Outcome => uint256) public sharesBought;

    // Tracks the amount of shares bought by each user for each outcome
    //mapping(address => mapping(Outcome => uint256)) public userShares;
    // Tracks the liquidity contributed by each user
    //mapping(address => uint256) public liquidityContributed;

    event SharesPurchased(address indexed buyer, uint256 sharesOutcome1, uint256 sharesOutcome2);
    event OutcomeSet(Outcome outcome);
    event LiquidityWithdrawn(address indexed to, uint256 amount);
    event LiquidityEarned(address indexed liquidityProvider, uint256 earnedAmount);

    constructor() ERC20("LiquidityPoolToken", "BPDAVISI") Ownable(msg.sender) {

    }


    function buySharesForAllOutcomes(string memory liquidityPoolKey, address buyer) external payable {
        console.log("buySharesForAllOutcomes", msg.value);
        require(msg.value > 0, "Must send Ether to buy shares");
        LiquidityPool storage liquidityPool = liquidityPools[liquidityPoolKey];
        console.log("totalLiquidity", liquidityPool.totalLiquidity);

        // Calculate how many shares to mint for each outcome
        uint256 shares = msg.value / 2;  // Distribute Ether equally across all outcomes (could be customized)

        // Mint the same number of shares for each outcome
        _mint(buyer, shares * 2);

        // Distribute shares to each outcome
        liquidityPool.sharesBought[Outcome.Outcome1] += shares;
        liquidityPool.sharesBought[Outcome.Outcome2] += shares;

        liquidityPool.userShares[buyer][Outcome.Outcome1] += shares;
        liquidityPool.userShares[buyer][Outcome.Outcome2] += shares;

        // Add liquidity to the contract
        liquidityPool.totalLiquidity += msg.value;
        liquidityPool.liquidityContributed[buyer] += msg.value;

        emit SharesPurchased(buyer, shares, shares);
    }

    // Function to set the outcome (only owner can do this)
    function resolvePool(string memory liquidityPoolKey, Outcome outcome) external onlyOwner {
        require(outcome != Outcome.None, "Invalid outcome");
        LiquidityPool storage liquidityPool = liquidityPools[liquidityPoolKey];
    
        liquidityPool.finalOutcome = outcome;
        currentOutcome = outcome;
        emit OutcomeSet(outcome);
    }

    // Function for users to redeem their shares if the outcome is known
    function redeemShares(string memory liquidityPoolKey, address buyer) external {
        require(currentOutcome != Outcome.None, "Outcome not set");
        uint256 userTotalShares = 0;

        LiquidityPool storage liquidityPool = liquidityPools[liquidityPoolKey];

        // Determine the total amount of shares the user holds for the winning outcome
        userTotalShares = liquidityPool.userShares[buyer][currentOutcome];

        require(userTotalShares > 0, "No shares to redeem for the winning outcome");

        uint256 totalSharesForOutcome = liquidityPool.sharesBought[currentOutcome];
        uint256 reward = (userTotalShares / totalSharesForOutcome) * liquidityPool.totalLiquidity ;


        // Transfer the Ether to the user as the reward for the winning outcome
        require(address(this).balance >= reward/2 , "Insufficient contract balance");
        (bool success, bytes memory data ) = msg.sender.call{value: reward/2 }("");
        console.logBytes(data);
        require(success, "Transfer to contract failed");



        // Burn the user's shares after redemption
        _burn(buyer, userTotalShares);

        // Reset the user's shares for the outcome
        liquidityPool.userShares[buyer][currentOutcome] = 0;
    }

    // Function for liquidity providers to earn fees based on their contribution
    function withdrawLiquidity(string memory liquidityPoolKey, address buyer) external {
        LiquidityPool storage liquidityPool = liquidityPools[liquidityPoolKey];
        uint256 liquidity = liquidityPool.liquidityContributed[buyer];
        require(liquidity > 0, "No liquidity contributed");

        // Calculate the proportion of the total liquidity
        uint256 shareOfPool = (liquidity * liquidityPool.totalLiquidity) / liquidityPool.totalLiquidity;
        uint256 reward = shareOfPool;

        // Transfer the reward (fees earned) to the liquidity provider
        payable(buyer).transfer(reward);

        // Reset the user's liquidity contribution
        liquidityPool.liquidityContributed[buyer] = 0;

        emit LiquidityEarned(buyer, reward);
    }

    // Function to withdraw any unused liquidity (only owner can do this)
    function withdrawLiquidity(string memory liquidityPoolKey, uint256 amount) external onlyOwner {
        LiquidityPool storage liquidityPool = liquidityPools[liquidityPoolKey];
        require(amount <= liquidityPool.totalLiquidity, "Not enough liquidity in the contract");

        liquidityPool.totalLiquidity -= amount;
        payable(owner()).transfer(amount);

        emit LiquidityWithdrawn(owner(), amount);
    }

      // Function to buy shares for a specific outcome (Outcome1, Outcome2)
    function buySharesForOutcome(string memory liquidityPoolKey, Outcome outcome, address buyer) external payable {
        console.log("buySharesForOutcome");
        console.log(buyer);
        require(outcome != Outcome.None, "Invalid outcome");
        require(msg.value > 0, "Must send Ether to buy shares");

        LiquidityPool storage liquidityPool = liquidityPools[liquidityPoolKey];

        uint256 fee = (msg.value * 5) / 100;
        uint256 netValue = msg.value - fee;

        uint256 price = computeOutcomePrice(liquidityPoolKey, outcome);
        uint256 shares = netValue / price;

        require(shares > 0, "Insufficient value to buy shares");

        // Mint the shares based on the calculated price
        _mint(buyer, shares);

        // Update the shares bought for the specific outcome
        liquidityPool.sharesBought[outcome] += shares;

        // Update the user's shares for the specific outcome
        liquidityPool.userShares[buyer][outcome] += shares;

        // Add liquidity to the contract
        liquidityPool.totalLiquidity += msg.value;
        liquidityPool.liquidityContributed[buyer] += msg.value;


        uint256 totalShareCost = price*shares;
        // Repay user any leftover fees
        if(totalShareCost < netValue) {
            
            uint256 refund = netValue - totalShareCost;

            (bool success, bytes memory data) = buyer.call{value: refund}("");
            require(success, "Refund failed");
        }

        emit SharesPurchased(buyer, 
                             outcome == Outcome.Outcome1 ? shares : 0, 
                             outcome == Outcome.Outcome2 ? shares : 0);
    }

    // Calculate the price based on the Proportional Market Maker approach
    function computeOutcomePrice(string memory liquidityPoolKey, Outcome outcome) public view returns (uint256) {
        LiquidityPool storage liquidityPool = liquidityPools[liquidityPoolKey];

        uint256 supply = liquidityPool.sharesBought[outcome];

        Outcome contraOutcome =(outcome == Outcome.Outcome1? Outcome.Outcome2 : Outcome.Outcome1);
        uint256 contraSupply = liquidityPool.sharesBought[contraOutcome];

        if(supply == 0 || supply + contraSupply == 0) {
            return scalingFactor / 2;
        }

        return supply /(supply + contraSupply);
    }

    function getTotalLiquidity(string memory liquidityPoolKey) public view returns (uint256) {
        LiquidityPool storage liquidityPool = liquidityPools[liquidityPoolKey];

        return liquidityPool.totalLiquidity;
    }

    function getUserShares(string memory liquidityPoolKey, address user, Outcome outcome) public view returns (uint256) {
        LiquidityPool storage liquidityPool = liquidityPools[liquidityPoolKey];

        return liquidityPool.userShares[user][outcome];
    }

    // Fallback function to accept Ether deposits
    receive() external payable {}
}


