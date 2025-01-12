// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

/**
 * @title IVerifier
 * @notice Interface for the Verifier contract
 */
interface IVerifier {
    /**
     * @notice Verifies the validity of a zero-knowledge proof
     * @param _pA First parameter of the proof (G1 point)
     * @param _pB Second parameter of the proof (G2 point)
     * @param _pC Third parameter of the proof (G1 point)
     * @param _pubSignals Public input signals for the proof
     * @return Returns `true` if the proof is valid, otherwise `false`
     */
    function verifyProof(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[1] calldata _pubSignals
    ) external view returns (bool);
}
