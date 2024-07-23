import { Sequelize } from "sequelize";
import { DATABASE, HOST, PASSWORD, USERNAME } from "../config/config.js";

export const db = new Sequelize(DATABASE, USERNAME, PASSWORD, {
  host: HOST,
  dialect: "mysql",
});
