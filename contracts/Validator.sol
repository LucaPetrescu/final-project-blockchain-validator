// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Validator
 * @dev Decentralized outcome validation using Chainlink oracles.
 */

contract Validator is ChainlinkClient, Ownable {
    using Chainlink for Chainlink.Request;

    address public coreBetting;
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    event OutcomeRequested(uint256 marketId, bytes requestId);
    event OutcomeValidated(uint256 marketId, bool outcome);

}