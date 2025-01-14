const express = require("express");
const router = express.Router();
const coreBettingContractController = require("../controllers/coreBettingContractController");

router.post("/createMarket", coreBettingContractController.createMarket);
router.post("/placeBet", coreBettingContractController.placeBet);
router.post("/createBet", coreBettingContractController.createBet);

router.get("/getMarkets", coreBettingContractController.getMarkets);
router.get("/getMarket", coreBettingContractController.getMarket);
router.get("/getMarketBets", coreBettingContractController.getMarketBets);

module.exports = router;
