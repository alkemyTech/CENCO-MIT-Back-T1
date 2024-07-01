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
    // Check if first name, last name, email, and password are provided
    if (!firstName || !lastName || !email || !password) {
      throw new Error('First name, last name, email, and password are required.');
    }
    // Check if email is provided
    if (!email) {
      throw new Error("Email is required");
    }
    // Check if the email already exists in the database
    if (await User.findOne({ where: { email: email } })) {
      throw new Error("User already exists");
    }
    // Validate email format
    if (!validateEmail(email)) {
      throw new Error("Invalid email format");
    }
    // Validate password complexity requirements
    if (!validatePassword(password)) {
      throw new Error(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
    }
    // Validate first name length and format
    if (!validateName(firstName)) {
      throw new Error("First name must be between 2 and 50 characters.");
    }
    // Validate last name length and format
    if (!validateName(lastName)) {
      throw new Error("Last name must be between 2 and 50 characters.");
    }
    // Validate date format for birthdate
    if (!validateDateFormat(birthdate)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD.");
    }
    // Validate if the user is 18 years of age or older
    if (!validateAge(birthdate)) {
      throw new Error("Must be 18 years of age or older");
    }

    user.password = await bcrypt.hash(password, SALT_ROUNDS);
    return await User.create({ ...user, email, password: user.password, firstName, lastName, birthdate  });
  },
};
