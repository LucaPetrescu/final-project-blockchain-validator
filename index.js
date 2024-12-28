const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const greetingRoutes = require("./routes/helloWorldContractRoutes");

const app = express();

require("dotenv").config();

app.use(morgan("dev"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/greetingContract", greetingRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
