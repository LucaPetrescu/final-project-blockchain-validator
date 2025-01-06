// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

struct Bet {
    uint256 betID;
    string description;
    uint256 totalYes;
    uint256 totalNo;
    address creator;
    bool resolved;

    // ToDo: Make this optional
    bool outcome;
}