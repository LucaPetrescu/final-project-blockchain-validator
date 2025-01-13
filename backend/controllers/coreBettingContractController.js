const { ethers } = require("ethers");
const {
  abi,
} = require("../artifacts/contracts/CoreBetting.sol/CoreBetting.json");

const { generateProof } = require("../helpers/generateProof");

const provider = new ethers.JsonRpcProvider(process.env.LOCAL_PROVIDER);

require("dotenv").config();

const privateKey = process.env.LOCAL_PRIVATE_KEY;

const wallet = new ethers.Wallet(privateKey, provider);

const contractAddress = process.env.CORE_BETTING_CONTRACT_ADDRESS;

const coreBetting = new ethers.Contract(contractAddress, abi, wallet);

exports.createMarket = async (req, res) => {
  const { description, resolutionTimestamp, deadline } = req.body;

  try {
    const futureTime = new Date();
    futureTime.setHours(futureTime.getHours() + resolutionTimestamp);
    const resolutionTimestampConverted = Math.floor(
      futureTime.getTime() / 1000
    );

    const futureDeadline = new Date();
    futureDeadline.setHours(futureDeadline.getHours() + deadline);
    const deadlineConverted = Math.floor(futureDeadline.getTime() / 1000);

    const { proof, publicSignals } = await generateProof();

    console.log(proof);

    const a = proof.pi_a.slice(0, 2);
    const b = [proof.pi_b[0].slice(0, 2), proof.pi_b[1].slice(0, 2)];
    const c = proof.pi_c.slice(0, 2);

    const tx = await coreBetting.createMarket(
      description,
      resolutionTimestampConverted,
      deadlineConverted,
      a,
      b,
      c,
      publicSignals
    );
    await tx.wait();

    res.send({ success: true, txHash: tx.hash });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
};

exports.placeBet = async (req, res) => {
  const { marketId, choice, amount } = req.body;
  try {
    const tx = await coreBetting.placeBet(marketId, choice, {
      value: ethers.utils.parseEther(amount),
    });
    await tx.wait();
    res.send({ success: true, txHash: tx.hash });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
};

exports.getMarkets = async (req, res) => {
  try {
    const tx = await coreBetting.getMarkets();
    await tx.wait();
    res.send({ success: true, txHash: tx.hash });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
};

exports.getMarket = async (req, res) => {
  const { marketId } = req.body;

  try {
    const tx = await coreBetting.getMarket(marketId);
    await tx.wait();
    res.send({ success: true, txHash: tx.hash });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
};

exports.getMarketBets = async (req, res) => {
  const { marketId } = req.body;

  try {
    const tx = await coreBetting.getMarket(marketId);
    await tx.wait();

    res.send({ success: true, txHash: tx.hash });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
};
