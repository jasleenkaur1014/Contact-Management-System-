export default class UserModel {
  constructor(name, email, password, createdAt) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
  }

  toJSON() {
    return {
      name: this.name,
      email: this.email,
      createdAt: this.createdAt,
    };
  }
}
