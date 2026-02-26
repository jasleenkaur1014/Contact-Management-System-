export default class ContactModel {
  constructor(name, phoneNumber, email, address, category, userId, createdAt) {
    this.name = name;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.address = address;
    this.category = category;
    this.userId = userId;
    this.createdAt = createdAt;
  }
}
