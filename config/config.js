import dotenv from 'dotenv';

dotenv.config();

export const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
export const JWT_SECRET = process.env.JWT_SECRET;
