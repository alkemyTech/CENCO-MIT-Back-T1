import { Sequelize } from "sequelize";

const database = "talent_alke";
const username = "root";
const password = "root";
const host = "localhost";

export const db = new Sequelize(database, username, password, {
  host,
  dialect: "mysql",
});
