const express = require("express");
const router = express.Router();
const helloWorldContractController = require("../controllers/helloWorldContractController");

router.get("/getGreeting", helloWorldContractController.getGreeting);
router.post("/setGreeting", helloWorldContractController.setGreeting);

module.exports = router;
