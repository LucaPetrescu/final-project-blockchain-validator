// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// import "@uma/core/contracts/optimistic-oracle-v2/interfaces/OptimisticOracleV2Interface.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./structs/Market.sol";
import { Verifier } from "./Verifier.sol";


contract CoreBetting  {

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Bet)) public userBets;

    uint256 public marketCount;

    Verifier public verifier;

    event MarketCreated(uint256 marketId, string description, uint256 resolutionTimestamp);
    event BetPlaced(uint256 marketId, address user, uint256 amount, bool choice);
    
    constructor(address verifierAddress) {
        verifier = Verifier(verifierAddress);
    }

    function createMarket(string calldata description, uint256 resolutionTimestamp, 
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[1] calldata inputs) external {
        require(resolutionTimestamp > block.timestamp, "Resolution time must be in the future.");

        bool isValid = verifier.verifyProof(a, b, c, inputs);
        require(isValid, "Invalid proof");

        markets[marketCount++] = Market({
            description: description,
            resolutionTimestamp: resolutionTimestamp,
            totalYes: 0,
            totalNo: 0,
            creator: msg.sender,
            resolved: false,
            outcome: false
        });

        emit MarketCreated(marketCount - 1, description, resolutionTimestamp);

    }

    function placeBet(uint256 marketId, bool choice) external payable {
        Market storage market = markets[marketId];
        require(block.timestamp < market.resolutionTimestamp, "Betting period is over.");
        require(msg.value > 0, "Bet amount must be greater than zero.");

        emit BetPlaced(marketId, msg.sender, msg.value, choice);
    }
    
}