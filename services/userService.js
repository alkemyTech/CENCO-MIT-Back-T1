import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { JWT_SECRET, SALT_ROUNDS } from "../config/config.js";

const validatePassword = (password) => (
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /\d/.test(password) &&
  /[!@#$%^&*(),.?":{}|<>]/.test(password)
);

export const userService = {
  login: async (email, password) => {
    try {
      // Authenticate user by email and password
      // Verify email
      const userFoundByEmail = await User.findOne({ where: { email: email } });

      if (!userFoundByEmail) {
        return null;
      }

      // Verify password
      const verifyPassword = await bcrypt.compare(password, userFoundByEmail.password);

      if (!verifyPassword) {
        throw new Error("Invalid credentials");
      }

      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
      return token;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  },
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
