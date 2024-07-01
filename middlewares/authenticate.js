import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config.js";
import { adminService } from "../services/adminService.js";

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).send({ message: "No access token provided" });
Error al obtener usuarios    }

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).send({ message: "No access token provided" });
  }
};

export const authenticateAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).send({ message: "No access token provided" });
    }

    const payload = jwt.verify(token, JWT_SECRET);

    const isAdmin = await adminService.isAdmin(payload);

    if (!isAdmin) {
      return res.status(403).send({ message: "Permission denied" });
    }

    req.user = payload;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).send({ message: "No access token provided" });
  }
};