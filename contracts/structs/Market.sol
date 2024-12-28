// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

struct Market {
    string description;
    uint256 resolutionTimestamp;
    uint256 totalYes;
    uint256 totalNo;
    address creator;
    bool resolved;
    bool outcome;
}