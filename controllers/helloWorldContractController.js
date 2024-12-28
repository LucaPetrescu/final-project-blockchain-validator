const { ethers } = require("ethers");
const {
  abi,
} = require("../artifacts/contracts/HelloWorld.sol/HelloWorld.json");

const provider = new ethers.providers.JsonRpcProvider(
  process.env.LOCAL_PROVIDER
);

require("dotenv").config();

const wallet = provider.getSigner();

const contractAddress = process.env.CONTRACT_ADDRESS;

const contract = new ethers.Contract(contractAddress, abi, wallet);

exports.getGreeting = async (req, res) => {
  try {
    const greeting = await contract.getGreeting();
    res.status(200).send({ success: true, greeting });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
};

exports.setGreeting = async (req, res) => {
  try {
    const { newGreeting } = req.body;
    const tx = await contract.setGreeting(newGreeting);
    await tx.wait();
    res.status(200).send({ success: true, txHash: tx.hash });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
};
