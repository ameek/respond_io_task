import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// TODO: Plug in your routes here
// const userRoutes = require("./routes/userRoutes");
// app.use("/api/users", userRoutes);
app.get("/", (req, res) => {
  res.res.send("API health check OK");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
