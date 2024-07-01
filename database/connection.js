import { Sequelize } from "sequelize";
import { DATABASE, HOST, PASSWORD, USERNAME } from "../config/config";

export const db = new Sequelize(DATABASE, USERNAME, PASSWORD, {
  host: HOST,
  dialect: "mysql",
});
