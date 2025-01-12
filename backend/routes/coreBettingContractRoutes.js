const express = require("express");
const router = express.Router();
const coreBettingContractAddress = require("../controllers/coreBettingContractController");

router.post("/createMarket", coreBettingContractAddress.createMarket);
router.post("/placeBet", coreBettingContractAddress.placeBet);

router.get("/getMarkets", coreBettingContractAddress.getMarkets);
router.get("/getMarket", coreBettingContractAddress.getMarket);
router.get("/getMarketBets", coreBettingContractAddress.getMarketBets);

module.exports = router;
