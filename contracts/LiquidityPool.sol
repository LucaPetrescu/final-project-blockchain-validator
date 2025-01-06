// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";


contract LiquidityPool is ERC20, Ownable {
    enum Outcome { None,Outcome1, Outcome2, Outcome3 }  // Define possible outcomes for the prediction market
    Outcome public currentOutcome;  // The outcome of the event (set by the owner)
    uint256 public totalLiquidity;  // Total liquidity in the contract
        // Bonding curve parameters
    uint256 public slope;  // Slope (a) for the linear bonding curve
    uint256 public intercept;  // Intercept (b) for the linear bonding curve

    // Reserves for each outcome in the AMM (to simulate liquidity pools)
    uint256 public reserveOutcome1;
    uint256 public reserveOutcome2;
    uint256 public reserveOutcome3;

    // Tracks the amount of shares bought per outcome
    mapping(Outcome => uint256) public sharesBought;

    // Tracks the amount of shares bought by each user for each outcome
    mapping(address => mapping(Outcome => uint256)) public userShares;
    // Tracks the liquidity contributed by each user
    mapping(address => uint256) public liquidityContributed;

    event SharesPurchased(address indexed buyer, uint256 sharesOutcome1, uint256 sharesOutcome2, uint256 sharesOutcome3);
    event OutcomeSet(Outcome outcome);
    event LiquidityWithdrawn(address indexed to, uint256 amount);
    event LiquidityEarned(address indexed liquidityProvider, uint256 earnedAmount);

    constructor(uint256 _slope, uint256 _intercept) ERC20("LiquidityPoolToken", "BPDAVISI") Ownable(msg.sender) {
        slope = _slope;
        intercept = _intercept;
    }

    // Function to buy shares for all outcomes (Outcome1, Outcome2, Outcome3)
    function buySharesForAllOutcomes() external payable {
        console.log("buySharesForAllOutcomes", msg.value);
        console.log("totalLiquidity", totalLiquidity);
        require(msg.value > 0, "Must send Ether to buy shares");

        // Calculate how many shares to mint for each outcome
        uint256 shares = msg.value / 3;  // Distribute Ether equally across all outcomes (could be customized)

        // Mint the same number of shares for each outcome
        _mint(msg.sender, shares * 3);

        // Distribute shares to each outcome
        sharesBought[Outcome.Outcome1] += shares;
        sharesBought[Outcome.Outcome2] += shares;
        sharesBought[Outcome.Outcome3] += shares;

        userShares[msg.sender][Outcome.Outcome1] += shares;
        userShares[msg.sender][Outcome.Outcome2] += shares;
        userShares[msg.sender][Outcome.Outcome3] += shares;

        // Add liquidity to the contract
        totalLiquidity += msg.value;
        liquidityContributed[msg.sender] += msg.value;

        emit SharesPurchased(msg.sender, shares, shares, shares);
    }

    // Function to set the outcome (only owner can do this)
    function setOutcome(Outcome outcome) external onlyOwner {
        require(outcome != Outcome.None, "Invalid outcome");
        currentOutcome = outcome;
        emit OutcomeSet(outcome);
    }

    // Function for users to redeem their shares if the outcome is known
    function redeemShares() external {
        require(currentOutcome != Outcome.None, "Outcome not set");
        uint256 userTotalShares = 0;

        // Determine the total amount of shares the user holds for the winning outcome
        userTotalShares = userShares[msg.sender][currentOutcome];

        require(userTotalShares > 0, "No shares to redeem for the winning outcome");

        uint256 totalSharesForOutcome = sharesBought[currentOutcome];
        uint256 reward = (userTotalShares / totalSharesForOutcome) * totalLiquidity ;

        // Transfer the Ether to the user as the reward for the winning outcome
        payable(msg.sender).transfer(reward);

        // Burn the user's shares after redemption
        _burn(msg.sender, userTotalShares);

        // Reset the user's shares for the outcome
        userShares[msg.sender][currentOutcome] = 0;
    }

    // Function for liquidity providers to earn fees based on their contribution
    function withdrawLiquidity() external {
        uint256 liquidity = liquidityContributed[msg.sender];
        require(liquidity > 0, "No liquidity contributed");

        // Calculate the proportion of the total liquidity
        uint256 shareOfPool = (liquidity * totalLiquidity) / totalLiquidity;
        uint256 reward = shareOfPool;

        // Transfer the reward (fees earned) to the liquidity provider
        payable(msg.sender).transfer(reward);

        // Reset the user's liquidity contribution
        liquidityContributed[msg.sender] = 0;

        emit LiquidityEarned(msg.sender, reward);
    }

    // Function to withdraw any unused liquidity (only owner can do this)
    function withdrawLiquidity(uint256 amount) external onlyOwner {
        require(amount <= totalLiquidity, "Not enough liquidity in the contract");

        totalLiquidity -= amount;
        payable(owner()).transfer(amount);

        emit LiquidityWithdrawn(owner(), amount);
    }

      // Function to buy shares for a specific outcome (Outcome1, Outcome2, or Outcome3)
    function buySharesForOutcome(Outcome outcome) external payable {
        require(outcome != Outcome.None, "Invalid outcome");
        require(msg.value > 0, "Must send Ether to buy shares");

        uint256 price = calculatePrice(outcome);
        uint256 shares = msg.value / price;

        require(shares > 0, "Insufficient value to buy shares");
        

        // Mint the shares based on the calculated price
        _mint(msg.sender, shares);

        // Update the shares bought for the specific outcome
        sharesBought[outcome] += shares;

        // Update the user's shares for the specific outcome
        userShares[msg.sender][outcome] += shares;

        // Add liquidity to the contract
        totalLiquidity += msg.value;
        liquidityContributed[msg.sender] += msg.value;

        emit SharesPurchased(msg.sender, 
                             outcome == Outcome.Outcome1 ? shares : 0, 
                             outcome == Outcome.Outcome2 ? shares : 0, 
                             outcome == Outcome.Outcome3 ? shares : 0);
    }

    // Calculate the price based on the linear bonding curve
    function calculatePrice(Outcome outcome) public view returns (uint256) {
        uint256 supply = sharesBought[outcome];
        return slope * supply + intercept;
    }

    // Fallback function to accept Ether deposits
    receive() external payable {}
}


