import { Sequelize } from "sequelize";

const database = "talent_alke";
const username = "root";
const password = "8515844";
const host = "localhost";

export const db = new Sequelize(database, username, password, {
  host,
  dialect: "mysql",
});
