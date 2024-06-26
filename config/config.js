import dotenv from 'dotenv';

dotenv.config();

export const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
