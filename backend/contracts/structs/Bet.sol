// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { LiquidityPool } from "./LiquidityPool.sol";

struct Bet {
    uint256 betID;
    string description;
    string liquidityPoolKey;
    address creator;
    bool resolved;

    // ToDo: Make this optional
    bool outcome;
}