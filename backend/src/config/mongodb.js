import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

let client;
let db;

let baseUrl = process.env.DB_URL;
let dbName = process.env.DB_NAME;
export const connectToMongoDB = async () => {
  try {
    client = new MongoClient(baseUrl);
    await client.connect();

    db = client.db(dbName);
    console.log("Connected to db: " + dbName);
  } catch (err) {
    console.log("Error in connecting with mongodb!" + err);
  }
};

export const getDB = () => {
  return db;
};

export async function createIndexes() {
  if (!db) {
    throw new Error("Database not initialized");
  }
  await db.collection("users").createIndex({ email: 1 }, { unique: true });

  await db
    .collection("contactList")
    .createIndex({ userId: 1, name: 1 }, { unique: true });

  await db
    .collection("contactList")
    .createIndex({ userId: 1, email: 1 }, { unique: true });
  await db
    .collection("contactList")
    .createIndex({ userId: 1, createdAt: -1 }, { unique: true });
}
