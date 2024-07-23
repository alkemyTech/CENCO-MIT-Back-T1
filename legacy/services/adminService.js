import { Op } from "sequelize";
import { User } from "../models/user.js";

export const adminService = {
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

  getUsers: async (requestingUser) => {
    try {
      const users = await User.findAll({
        attributes: [
          "firstName",
          "lastName",
          "email",
          "phone",
          "country",
          "birthdate",
          "role",
        ],
      });
      return users;
    } catch (error) {
      console.error("Error getting users:", error);
      throw error;
    }
  },
  // dynamic search by fields firstname, lastName, email, country for a more complex search if required
  searchUsers: async (searchParams) => {
    try {
      const { firstName, lastName, email, country } = searchParams;
      const whereClause = {};

      if (firstName) {
        whereClause.firstName = { [Op.like]: `${firstName}%` };
      }
      if (lastName) {
        whereClause.lastName = { [Op.like]: `${lastName}%` };
      }
      if (email) {
        whereClause.email = { [Op.like]: `${email}%` };
      }
      if (country) {
        whereClause.country = { [Op.like]: `%${country}%` };
      }

      const usersFound = await User.findAll({
        where: whereClause,
        attributes: [
          "firstName",
          "lastName",
          "email",
          "phone",
          "country",
          "birthdate",
          "role",
        ],
      });

      return usersFound;
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  },
};
