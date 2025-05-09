import dotenv from 'dotenv';
dotenv.config();

// Load environment variables from .env file
export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRATION || '1h';
export const DB_NAME = process.env.DB_NAME;