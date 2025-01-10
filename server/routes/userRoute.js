const express = require("express");
const userAuth = require("../middleware/userAuth");
const getUserInfo = require("../controller/userController");

const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserInfo);

module.exports = userRouter;
