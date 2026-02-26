import jwt from "jsonwebtoken";
import { ApplicationError } from "./errorHandling.middleware.js";
import { ObjectId } from "mongodb";

const jwtAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send("Unauthorized!");
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    return res.status(401).send("Unauthorized!");
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.userId || !ObjectId.isValid(payload.userId)) {
      return next(new ApplicationError("Invalid user", 401));
    }
    req.userId = payload.userId;
    return next();
  } catch (err) {
    return res.status(401).send("Unauthorized!");
  }
};

export default jwtAuth;
