// SPDX-License-Identifier: GPL-3.0

import "../interfaces/IVerifier.sol";

/**
 * @title MockVerifier
 * @notice Mock implementation of the IVerifier interface for testing purposes
 */
contract MockVerifier is IVerifier {
    // Variable to store the mock return value of the verifyProof function
    bool private mockResult = true;

    /**
     * @notice Sets the mock result for the verifyProof function
     * @param _result The result to return when verifyProof is called
     */
    function setMockResult(bool _result) external {
        mockResult = _result;
    }

    /**
     * @notice Mock implementation of the verifyProof function
     * @param _pA First parameter of the proof (G1 point)
     * @param _pB Second parameter of the proof (G2 point)
     * @param _pC Third parameter of the proof (G1 point)
     * @param _pubSignals Public input signals for the proof
     * @return Returns the mock result set by setMockResult
     */
    function verifyProof(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[1] calldata _pubSignals
    ) external view override returns (bool) {
        // Return the mock result
        return mockResult;
    }
}
