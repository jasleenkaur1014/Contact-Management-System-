import { body, query } from "express-validator";
import { getDB } from "../../config/mongodb.js";
import { ObjectId } from "mongodb";

export const newContactValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required!")
    .bail()
    .custom(async (name, { req }) => {
      const db = getDB();
      const userId = req.userId;
      const checkName = await db
        .collection("contactList")
        .findOne({ name, userId });
      if (checkName) {
        throw new Error("This name already exist. Try using another name!");
      }
      return true;
    }),

  body("phoneNumber")
    .matches(/^\d{10}$/)
    .withMessage("Invalid Contact Number!"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email")
    .bail()
    .custom(async (email, { req }) => {
      const db = getDB();
      const userId = req.userId;
      const checkEmail = await db
        .collection("contactList")
        .findOne({ email, userId });

      if (checkEmail) {
        throw new Error("You already have a contact with this email");
      }
      return true;
    }),

  body("category").trim().notEmpty().withMessage("Category must be Provided!"),

  body("address").notEmpty().withMessage("Please provide an address!"),
];

export const updateContactValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be Empty")
    .bail()
    .custom(async (name, { req }) => {
      const db = getDB();
      const userId = req.userId;
      const contactId = req.params.id;
      const existing = await db
        .collection("contactList")
        .findOne({ name, userId, _id: { $ne: new ObjectId(contactId) } });

      if (existing)
        throw new Error("You already have a contact with this name");
      return true;
    }),

  body("phoneNumber")
    .optional()
    .trim()
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits!"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Inavlid email format")
    .bail()
    .custom(async (email, { req }) => {
      const db = getDB();
      const userId = req.userId;
      const contactId = req.params.id;
      const existing = await db
        .collection("contactList")
        .findOne({ email, userId, _id: { $ne: new ObjectId(contactId) } });

      if (existing)
        throw new Error("You already have a contact with this email");
      return true;
    }),

  body("address")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Address cannot be empty if provided"),
];

export const sortingContactValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be greater than or equal to 1"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be greater than or equal to 1"),
  query("order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Order must be asc or desc"),
  query("sortBy")
    .optional()
    .isIn(["name", "category"])
    .withMessage("SortBy invalid"),
  query("category")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category cannot be empty if provided"),
  query("search")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Search keyword cannot be empty if provided"),
];
