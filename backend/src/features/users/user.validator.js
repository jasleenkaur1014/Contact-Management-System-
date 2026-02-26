import { body } from "express-validator";
import UserRepository from "./users.repository.js";

const userRepo = new UserRepository();

// REGISTRATION VALIDATOR
export const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required!"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (email) => {
      const existingUser = await userRepo.findByEmail(email);

      if (existingUser) {
        throw new Error("Email already exist! Try Login into your account");
      }
      return true;
    }),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be atleast 6 characters!"),
];

// LOGIN VALIDATOR
export const loginValidator = [
  body("email").trim().isEmail().withMessage("Invalid Email"),
  body("password").notEmpty().withMessage("Password is required"),
];
