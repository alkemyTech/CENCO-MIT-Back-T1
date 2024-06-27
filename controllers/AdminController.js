
import { adminService } from "../services/adminService.js";

export const adminController = {
    getUsers: async (req, res) => {
      console.log("getAll")
      try {
        const users = await adminService.getUsers();
        res.status(200).json(users);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
};
