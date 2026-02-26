import { getDB } from "../../config/mongodb.js";
import { ObjectId } from "mongodb";
import { ApplicationError } from "../../middlewares/errorHandling.middleware.js";

export default class ContactRepository {
  constructor() {
    this.collection = "contactList";
  }

  async addNew(newContact) {
    const db = getDB();
    const collection = db.collection(this.collection);
    await collection.insertOne(newContact);
    return "New Contact Added!";
  }

  async viewAll(userId, page = 1, limit = 10, sortBy, order, filter = {}) {
    const db = getDB();
    const collection = db.collection(this.collection);
    const skip = (page - 1) * limit;
    const sortOrder = order === "asc" ? 1 : -1;
    const contacts = await collection
      .find({ userId: new ObjectId(userId), ...filter })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalContacts = await db
      .collection(this.collection)
      .countDocuments({ userId: new ObjectId(userId), ...filter });

    return {
      contacts,
      totalContacts,
      totalPages: Math.ceil(totalContacts / limit),
    };
  }

  async getContactById(id, userId) {
    const db = getDB();
    const collection = db.collection(this.collection);
    const contact = await collection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    if (!contact) {
      throw new ApplicationError("Contact Not Found!", 404);
    }
    return contact;
  }

  async update(id, userId, updateContact) {
    const allowedFields = [
      "name",
      "email",
      "phoneNumber",
      "address",
      "category",
    ];

    const updateData = {};
    for (const key of allowedFields) {
      if (updateContact[key] !== undefined) {
        updateData[key] = updateContact[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new ApplicationError(
        "At least one field is required to update",
        400,
      );
    }

    const db = getDB();
    const collection = db.collection(this.collection);

    const result = await collection.updateOne(
      { _id: new ObjectId(id), userId: new ObjectId(userId) },
      {
        $set: updateData,
      },
    );

    if (result.matchedCount === 0) {
      throw new ApplicationError("Contact Not Found!", 404);
    }

    return "Contact updated successfully!";
  }

  async delete(id, userId) {
    const db = getDB();
    const collection = db.collection(this.collection);
    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new ApplicationError("Contact Not Found!", 404);
    }
    return "Contact Deleted Succesfully!";
  }

  //   async search(userId, name) {
  //     const db = getDB();
  //     const collection = db.collection(this.collection);

  //     try {
  //       return await collection
  //         .find({
  //           userId: new ObjectId(userId),
  //           name: { $regex: name, $options: "i" },
  //         })
  //         .toArray();
  //     } catch (err) {
  //       throw new ApplicationError("Failed to search contacts", 500);
  //     }
  //   }

  async getTotalNumberOfContacts(userId) {
    const db = getDB();
    return await db
      .collection(this.collection)
      .countDocuments({ userId: new ObjectId(userId) });
  }

  async totalContactPerCategory(userId) {
    const db = getDB();
    const filteredContactCount = await db
      .collection(this.collection)
      .aggregate([
        {
          $match: {
            userId: new ObjectId(userId),
          },
        },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            category: "$_id",
            count: 1,
          },
        },
      ])
      .toArray();

    return filteredContactCount;
  }

  async recentlyAddedContacts(userId) {
    const db = getDB();
    return await db
      .collection(this.collection)
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
  }
}
