import dotenv from 'dotenv';

dotenv.config();

export const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
export const JWT_SECRET = process.env.JWT_SECRET;

export const DATABASE = process.env.DATABASE;
export const USERNAME = process.env.USER;
export const PASSWORD = process.env.PASSWORD;
export const HOST = process.env.HOST;
export const PORT = parseInt(process.env.PORT);
