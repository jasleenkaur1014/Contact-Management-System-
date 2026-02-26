import { ObjectId } from "mongodb";
import { ApplicationError } from "./errorHandling.middleware.js";

export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (!ObjectId.isValid(value)) {
      return next(new ApplicationError(`Invalid ${paramName}`, 400));
    }

    next();
  };
};
