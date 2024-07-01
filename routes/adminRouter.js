import { Router } from "express";
import { authenticateAdminToken } from "../middlewares/authenticate.js";
import { adminController } from "../controllers/adminController.js";

export const adminRouter = Router();

//Define the different sub routes of the main entity. In this case users
adminRouter.get("/users", authenticateAdminToken, adminController.getUsers);
//route to obtain users by dynamic search, requesting the admin token to verify the user role
adminRouter.get(
  "/searchUsers",
  authenticateAdminToken,
  adminController.searchUsers
);
