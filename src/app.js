import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import sequelize from "./config/db.js";
import redisClient from "./config/redis.js";

dotenv.config({ path: "./src/.env" });

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

console.log("DB_USER:", process.env.DB_USER);
console.log("REDIS_PASSWORD:", process.env.REDIS_PASSWORD);

// Test DB connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// Test Redis connection
redisClient
  .ping()
  .then((response) => {
    console.log("Redis connection successful:", response);
  })
  .catch((err) => {
    console.error("Unable to connect to Redis:", err);
  });

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ HealthStatus: "API health check OK" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
