import { ObjectId } from "mongodb";
import { ApplicationError } from "../../middlewares/errorHandling.middleware.js";
import ContactModel from "./contact.model.js";
import ContactRepository from "./contact.repository.js";

export default class ContactController {
  constructor() {
    this.repo = new ContactRepository();
  }

  async addNewContact(req, res, next) {
    try {
      const { name, phoneNumber, email, address, category } = req.body;
      const userId = req.userId;
      const newContact = new ContactModel(
        name,
        phoneNumber,
        email,
        address,
        category.toLowerCase(),
        new ObjectId(userId),
        new Date(),
      );

      await this.repo.addNew(newContact);

      res.status(201).json(newContact);
    } catch (err) {
      next(err);
    }
  }

  async viewAllContacts(req, res, next) {
    try {
      const userId = req.userId;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const sortBy = req.query.sortBy || "name";
      const order = req.query.order || "asc";

      const filter = {};
      if (req.query.category) {
        filter.category = req.query.category.toLowerCase();
      }

      if (req.query.search) {
        filter.name = { $regex: req.query.search, $options: "i" };
      }

      const { contacts, totalContacts, totalPages } = await this.repo.viewAll(
        userId,
        page,
        limit,
        sortBy,
        order,
        filter,
      );

      res.status(200).json({
        page,
        limit,
        totalPages,
        totalContacts,
        contacts,
      });
    } catch (err) {
      next(err);
    }
  }

  async getContactById(req, res, next) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const contact = await this.repo.getContactById(id, userId);
      res.status(200).json(contact);
    } catch (err) {
      next(err);
    }
  }

  async updateContact(req, res, next) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const updateContact = req.body;
      const contact = await this.repo.update(id, userId, updateContact);
      res.status(200).json({ message: contact });
    } catch (err) {
      next(err);
    }
  }

  async deleteContact(req, res, next) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const deletedContact = await this.repo.delete(id, userId);
      res.status(200).json({ message: deletedContact });
    } catch (err) {
      next(err);
    }
  }

  // async searchContact(req, res, next) {
  //   try {
  //     const userId = req.userId;
  //     const query = req.query.q;
  //     const searchedContact = await this.repo.search(userId, query);
  //     if (!searchedContact.length) {
  //       return res.status(200).send([]);
  //     }
  //     res.status(200).send(searchedContact);
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  async totalNumberOfContacts(req, res, next) {
    try {
      const userId = req.userId;
      const totalNumber = await this.repo.getTotalNumberOfContacts(userId);
      res.status(200).json({ totalContacts: totalNumber });
    } catch (err) {
      next(err);
    }
  }

  async totalContactsPerCategory(req, res, next) {
    try {
      const userId = req.userId;

      const sortedContactCount =
        await this.repo.totalContactPerCategory(userId);

      res.status(200).json({ sortedContactCount });
    } catch (err) {
      next(err);
    }
  }

  async recentlyAddedContacts(req, res, next) {
    try {
      const userId = req.userId;

      const recentlyAdded = await this.repo.recentlyAddedContacts(userId);

      res.status(200).json({ recentlyAdded });
    } catch (err) {
      next(err);
    }
  }
}
