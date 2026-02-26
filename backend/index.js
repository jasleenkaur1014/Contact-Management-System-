import dotenv from "dotenv";
dotenv.config();
import express from "express";
import contactRouter from "./src/features/contact/contact.routes.js";
import { connectToMongoDB, createIndexes } from "./src/config/mongodb.js";
import { errorHandlerMiddleware } from "./src/middlewares/errorHandling.middleware.js";
import userRouter from "./src/features/users/users.routes.js";
import jwtAuth from "./src/middlewares/jwt.middleware.js";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5500",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use("/api/user", userRouter);
app.use("/api/contact", jwtAuth, contactRouter);
app.use(errorHandlerMiddleware);

const PORT = 3000;

const startServer = async () => {
  try {
    await connectToMongoDB();
    await createIndexes();

    app.listen(PORT, () => {
      console.log("Server listening on port: ", PORT);
    });
  } catch (err) {
    console.log("Failed to start server!", err);
  }
};

startServer();
