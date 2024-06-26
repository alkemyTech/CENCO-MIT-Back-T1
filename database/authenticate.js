import { db } from "./connection.js";

export const authenticate = async () => {
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");

    await db.sync();
    console.log("Database synchronized");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
