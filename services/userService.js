import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { JWT_SECRET ,SALT_ROUNDS } from "../config/config.js";


const validatePassword = (password) => (
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /\d/.test(password) &&
  /[!@#$%^&*(),.?":{}|<>]/.test(password)
);

export const userService = {

  getUser: async (user) => {  
    return user;
  },
  getById: async (id) => {
    return await User.findByPk(id);
  },
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
  },

  isAdmin: async (user) => {
    try {
      const dbUser = await User.findOne({ where: { email: user.email } });
      if (!dbUser) throw new Error("No user found");
      return dbUser.role === "admin";
    } catch (error) {
      // handle error
      console.error(error);
      throw error; // Re-throw the error to be caught by the caller
    }
  },

  getUsers: (requestingUser) => {
    // Assuming User is an array-like object or a database model with a .map method
    return User.findAll() // Adjust this line if User is not a Sequelize model
      .then(users => users.map(u => ({
        
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        country: u.country,
        birthdate: u.birthdate,
        role: u.role,
      })))
      .catch(error => {
        // handle error
        console.error('Error al obtener usuarios:', error);
        throw error;
      });
  } 
};
