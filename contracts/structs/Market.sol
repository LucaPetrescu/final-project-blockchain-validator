// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;
import "./Bet.sol";

struct Market {
    string description;
    uint256 resolutionTimestamp;
    uint256 marketID;

    Bet[] bets;
}