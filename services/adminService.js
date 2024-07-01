
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
        console.error('Error getting users:', error);
        throw error;
      });
  },
  //Filter users by country
  filterByCountry: async (country) => {
    try {
      const usersFoundByCountry = await User.findAll({ where: { country: country } });
      // Loop through usersData array to determine which values to display
      const usersData = usersFoundByCountry.map(u => ({
        //returns only the necessary data
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        country: u.country,
        birthdate: u.birthdate,
        role: u.role,
      }));
      return usersData;
    } catch (error) {
      console.error("Error filtering users by country:", error);
      throw error;
    }
  }
};
