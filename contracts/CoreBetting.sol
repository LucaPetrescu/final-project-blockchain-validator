// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "hardhat/console.sol";

import "./structs/Market.sol";
import "./structs/Bet.sol";
import { Verifier } from "./Verifier.sol";
import { LiquidityPoolContainer } from "./LiquidityPoolContainer.sol";
import { Outcome } from "./structs/LiquidityPool.sol";

import { Validator } from "./Validator.sol";
import "./interfaces/IVerifier.sol";


contract CoreBetting  {

    mapping(uint256 => Market) private markets;
    uint256 private marketCount;

    mapping(uint256 => mapping(address => Bet)) private userBets;



    IVerifier public verifier;
    LiquidityPoolContainer public liquidityPoolContainer;
    Validator public validator;

    event MarketCreated(uint256 marketId, string description, uint256 resolutionTimestamp);
    event BetCreated(uint256 betID, string description);
    event BetPlaced(uint256 marketId, address user, uint256 amount, bool choice);
    
    constructor(address verifierAddress, address liquidityPoolContainerAddress, address validatorAddress) {
        verifier = Verifier(verifierAddress);
        liquidityPoolContainer = LiquidityPoolContainer(payable(liquidityPoolContainerAddress));
        validator = Validator(validatorAddress);
    }

    function createMarket(
        string calldata description, 
        uint256 resolutionTimestamp, 
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[1] calldata inputs
    ) external {
        require(resolutionTimestamp > block.timestamp, "Resolution time must be in the future.");

        // Verify the proof using the Verifier contract
        bool isValid = verifier.verifyProof(a, b, c, inputs);
        require(isValid, "Invalid proof");

        // Store the current market ID before incrementing
        uint256 currentMarketId = marketCount;

        // Initialize the Market struct without setting the bets array
        Market storage newMarket = markets[currentMarketId];
        newMarket.description = description;
        newMarket.resolutionTimestamp = resolutionTimestamp;
        newMarket.marketID = currentMarketId;

        markets[currentMarketId] = newMarket;
        // The bets array is automatically initialized as empty

        // Increment the market count for the next market
        marketCount++;

        // Emit the MarketCreated event
        emit MarketCreated(currentMarketId, description, resolutionTimestamp);
    }

    function createBet(string calldata description, uint256 marketID) external {
        uint256 betCount = markets[marketID].bets.length;

        // Initialize a new Bet struct
        Bet memory bet = Bet({
            betID: betCount,
            description: description,
            liquidityPoolKey: string(abi.encodePacked(marketID, ":", betCount)), 
            creator: msg.sender,
            resolved: false,
            outcome: false
        });

        // Add the bet to the market's bets array
        markets[marketID].bets.push(bet);

        emit BetCreated(++betCount, description);
    }

    function placeBet(uint256 marketId, uint256 betId, bool choice) external payable {
        Market storage market = markets[marketId];
        require(block.timestamp < market.resolutionTimestamp, "Betting period is over.");
        require(msg.value > 0, "Bet amount must be greater than zero.");

        // Here you would typically update the bet totals based on the choice
        // For example:
        if (choice) {
            liquidityPoolContainer.buySharesForOutcome(market.bets[betId].liquidityPoolKey, Outcome.Outcome1);
        } else {
            liquidityPoolContainer.buySharesForOutcome(market.bets[betId].liquidityPoolKey, Outcome.Outcome2);
        }

        emit BetPlaced(marketId, msg.sender, msg.value, choice);
    }

    function getMarket(uint256 marketId) external view returns (Market memory){
        console.log(marketCount);
        require(marketId < marketCount, "Invalid ID");
        return markets[marketId];
    }

    function getMarkets() external view returns (Market[] memory){
        Market[] memory marketArray = new Market[](marketCount);
        for (uint256 i = 0; i < marketCount; i++) {
            marketArray[i] = markets[i];  // Fetching each market by ID
        }

        return marketArray;
    }

    function getMarketBets(uint256 marketId) external view returns (Bet[] memory){
        return markets[marketId].bets;
    }
}

