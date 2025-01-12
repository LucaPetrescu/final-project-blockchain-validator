// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title HelloWorld
 * @dev A simple smart contract that stores and retrieves a greeting message.
 */

contract HelloWorld {

    string public greeting;

    /**
     * @dev Sets the initial greeting message upon deployment.
     * @param _greeting The initial greeting message.
     */

    constructor(string memory _greeting){
        greeting = _greeting;
    }

     /**
     * @notice Updates the greeting message.
     * @param _newGreeting The new greeting message.
     */
    function setGreeting(string memory _newGreeting) public {
        greeting = _newGreeting;
    }

    /**
     * @notice Retrieves the current greeting message.
     * @return The current greeting message.
     */
    function getGreeting() public view returns (string memory) {
        return greeting;
    }

}