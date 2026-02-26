import express from "express";
import ContactController from "./contact.controller.js";
import {
  newContactValidator,
  sortingContactValidator,
  updateContactValidator,
} from "./contact.validator.js";
import validate from "../../middlewares/validation.middleware.js";
import { validateObjectId } from "../../middlewares/validateObjectId.middleware.js";

const contactRouter = express.Router();

const contactController = new ContactController();

contactRouter.get("/", sortingContactValidator, validate, (req, res, next) => {
  contactController.viewAllContacts(req, res, next);
});

contactRouter.post("/", newContactValidator, validate, (req, res, next) => {
  contactController.addNewContact(req, res, next);
});

contactRouter.get("/totalContacts", (req, res, next) => {
  contactController.totalNumberOfContacts(req, res, next);
});

contactRouter.get("/recentContacts", (req, res, next) => {
  contactController.recentlyAddedContacts(req, res, next);
});

contactRouter.get("/contactPerCategory", (req, res, next) => {
  contactController.totalContactsPerCategory(req, res, next);
});

contactRouter.get("/:id", validateObjectId("id"), (req, res, next) => {
  contactController.getContactById(req, res, next);
});

contactRouter.put(
  "/:id/update",
  validateObjectId("id"),
  updateContactValidator,
  validate,
  (req, res, next) => {
    contactController.updateContact(req, res, next);
  },
);

contactRouter.delete("/:id", validateObjectId("id"), (req, res, next) => {
  contactController.deleteContact(req, res, next);
});

export default contactRouter;
