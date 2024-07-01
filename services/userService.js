import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { JWT_SECRET ,SALT_ROUNDS } from "../config/config.js";
import { validatePassword, validateEmail, validateName, validateDateFormat, validateAge  } from "../utils/validationUtils.js";

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
  create: async ({ password, email, firstName, lastName, birthdate, ...user }) => {
    if (!email) {
      throw new Error("Email is required");
    }
    if (await User.findOne({ where: { email: email } })) {
      throw new Error("User already exists");
    }

    if (!validateEmail(email)) {
      throw new Error("Invalid email format");
    }

    if (!validatePassword(password)) {
      throw new Error(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
    }

    if (!validateName(firstName)) {
      throw new Error("First name must be between 2 and 50 characters.");
    }

    if (!validateName(lastName)) {
      throw new Error("Last name must be between 2 and 50 characters.");
    }
    if (!validateDateFormat(birthdate)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD.");
    }
    if (!validateAge(birthdate)) {
      throw new Error("Must be 18 years of age or older");
    }

    user.password = await bcrypt.hash(password, SALT_ROUNDS);
    return await User.create({ ...user, email, password: user.password, firstName, lastName, birthdate  });
  },
};
