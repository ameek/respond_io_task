import dotenv from "dotenv";
dotenv.config();

// Load environment variables from .env file
export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRATION || "1h";
export const DB_NAME = process.env.DB_NAME;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const REFRESH_TOKEN_EXPIRES_IN =
  process.env.REFRESH_TOKEN_EXPIRATION || "86400s";
