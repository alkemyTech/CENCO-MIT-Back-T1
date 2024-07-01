import { adminService } from "../services/adminService.js";

export const adminController = {
  getUsers: async (req, res) => {
    console.log("getAll");
    try {
      const users = await adminService.getUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getUsersByCountry: async function (req, res) {
    //We get the country from the body
    const { country } = req.params;
    try {
      const users = await adminService.filterByCountry(country);
      res
        .status(200)
        .send({ message: `Found ${users.length} users.`, data: { users } });
    } catch (error) {
      console.error("Error filtering users by country:", error);
      return res
        .status(400)
        .send({ message: "Error filtering users by country." });
    }
  },
  searchUsers: async (req, res) => {
    const { firstName, lastName, email } = req.query;

    try {
      const searchParams = { firstName, lastName, email };
      const users = await adminService.searchUsers(searchParams);
      res
        .status(200)
        .send({ message: `Found ${users.length} users`, data: { users } });
    } catch (error) {
      console.error("Error searching users:", error);
      return res.status(400).send({ message: "Error searching users" });
    }
  },
};
