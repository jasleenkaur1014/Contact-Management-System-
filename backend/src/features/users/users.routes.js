import express from "express";
import UserController from "./users.controller.js";
import { registerValidator, loginValidator } from "./user.validator.js";
import validate from "../../middlewares/validation.middleware.js";

const userRouter = express.Router();
const userController = new UserController();

userRouter.post("/signup", registerValidator, validate, (req, res, next) => {
  userController.registerUser(req, res, next);
});
userRouter.post("/signin", loginValidator, validate, (req, res, next) => {
  userController.signIn(req, res, next);
});

export default userRouter;
