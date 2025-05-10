import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import sequelize from "./config/db.js";
import redisClient from "./config/redis.js";
// Routes
import authRoute from './routes/auth.route.js';
import noteRoute from './routes/note.route.js';

dotenv.config({ path: "./src/.env" });

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());


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

// Register routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/notes', noteRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
