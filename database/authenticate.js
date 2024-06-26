import { User } from "../models/User.js";
import { db } from "./connection.js";

export const authenticate = async () => {
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");

    await db.sync();

    const newUser = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      password: "password123",
      phone: "+1234567890",
      country: "USA",
      birthdate: "1990-01-01",
      role: "user",
      // it's not necessary specify createdAt, updatedAt because Sequelize will handle it automatically
    });

    console.log(newUser.dataValues);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
