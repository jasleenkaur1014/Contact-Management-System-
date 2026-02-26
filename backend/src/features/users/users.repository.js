import UserModel from "./users.model.js";
import { getDB } from "../../config/mongodb.js";

export default class UserRepository {
  constructor() {
    this.collectionName = "users";
  }

  async signUp(newUser) {
    // get the db
    const db = getDB();
    await db.collection(this.collectionName).insertOne(newUser);

    return new UserModel(newUser.name, newUser.email, null, newUser.createdAt);
  }

  async findByEmail(email) {
    const db = getDB();
    return await db.collection(this.collectionName).findOne({ email });
  }
}
