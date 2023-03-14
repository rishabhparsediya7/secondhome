require("dotenv").config();
const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const propertyRouter = require("../router/routers");


app.use(cors());
app.use(bodyParser.json());
app.use("/api/properties", propertyRouter);

const port = process.env.APP_PORT; 

app.listen(port, () => {
  console.log("server up and running on PORT :", port);
});