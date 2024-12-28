// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import './structs/Bet.sol';
import './structs/Market.sol';

/**
 * @title CoreBetting
 * @dev Enables users to create betting markets, participate, and claim rewards.
 */

contract CoreBetting {
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Belt)) public userBets;

    uint256 public marketCount;

    address public validator;

    event MarketCreated(uint256 marketId, string description, uint256 resolutionTimestamp);
    event BetPlaced(uint256 marketId, address indexed user, uint256 amount, bool choice);
    event MarketResolved(uint256 marketId, bool outcome);
    event RewardClaimed(uint256 marketId, address indexed user, uint256 reward);

    modifier onlyValidator() {
        require(msg.sender == validator, "Only validator can call this.");
        _;
    }
}