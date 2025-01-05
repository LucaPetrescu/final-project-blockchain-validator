const express = require("express");
const router = express.Router();
const coreBettingContractAddress = require("../controllers/coreBettingContractController");

router.post("/createMarket", coreBettingContractAddress.createMarket);

module.exports = router;
