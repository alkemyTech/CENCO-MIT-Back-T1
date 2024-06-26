import { Sequelize } from "sequelize";

const database = "talent_alke";
const username = "root";
const password = "123456";
const host = "localhost";

export const db = new Sequelize(database, username, password, {
  host,
  dialect: "mysql",
});
