// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

enum Outcome { None,Outcome1, Outcome2}  // Define possible outcomes for the prediction market
struct LiquidityPool {
    Outcome finalOutcome;
    // Tracks the amount of shares bought per outcome
    mapping(Outcome => uint256)  sharesBought;

    // Tracks the amount of shares bought by each user for each outcome
    mapping(address => mapping(Outcome => uint256))  userShares;
    // Tracks the liquidity contributed by each user
    mapping(address => uint256)  liquidityContributed;
    uint256  totalLiquidity;  // Total liquidity in the contract

}