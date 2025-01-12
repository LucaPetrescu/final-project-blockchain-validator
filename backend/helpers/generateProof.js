const snarkjs = require("snarkjs");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

exports.generateProof = async () => {
  try {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      {
        secret: process.env.SECRET,
      },
      "circuit_js/circuit.wasm",
      "circuit/circuit_0000.zkey"
    );

    return { proof, publicSignals };
  } catch (error) {
    console.error("Error generating proof:", error.message);
    throw error;
  }
};
