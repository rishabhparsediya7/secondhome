const propertyRouter = require("express").Router();
const { createProperty, getProperties } = require("../controller/controller");

propertyRouter.get("/", getProperties);
propertyRouter.post("/", createProperty);

module.exports = propertyRouter;