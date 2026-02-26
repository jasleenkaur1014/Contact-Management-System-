import UserModel from "./users.model.js";
import UserRepository from "./users.repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default class UserController {
  constructor() {
    this.repo = new UserRepository();
  }

  async registerUser(req, res, next) {
    try {
      // console.log(req.body);
      const { name, email, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = new UserModel(
        name,
        email,
        hashedPassword,
        new Date().toISOString(),
      );

      const savedUser = await this.repo.signUp(newUser);
      res.status(201).json({ user: savedUser.toJSON() });
    } catch (err) {
      next(err);
    }
  }

  async signIn(req, res, next) {
    try {
      // console.log(req.body);
      const user = await this.repo.findByEmail(req.body.email);
      if (!user) {
        return res.status(400).json({ message: "Invalid Credentials!" });
      } else {
        const result = await bcrypt.compare(req.body.password, user.password);

        if (result) {
          const token = jwt.sign(
            {
              userId: user._id,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "1h",
            },
          );

          return res.status(200).json({ token: token });
        } else {
          return res.status(400).json({ message: "Invalid Credentials!" });
        }
      }
    } catch (err) {
      next(err);
    }
  }
}
