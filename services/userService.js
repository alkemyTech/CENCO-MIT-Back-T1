import bcrypt from "bcrypt";
import { User } from "../models/user.js";
import { SALT_ROUNDS } from "../config/config.js";

const validatePassword = (password) => (
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /\d/.test(password) &&
  /[!@#$%^&*(),.?":{}|<>]/.test(password)
);

export const userService = {
  create: async ({ password, ...user }) => {
    if (await User.findOne({ where: { email: user.email } })) {
      throw new Error("User already exists");
    }

    if (!validatePassword(password)) {
      throw new Error(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
    }

    user.password = await bcrypt.hash(password, SALT_ROUNDS);
    return await User.create(user);
  }
};
