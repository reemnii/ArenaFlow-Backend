const express = require("express");
require("./config/env");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*";

// connect database
connectDB();

// middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", CLIENT_ORIGIN);
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "csc443-backend",
  });
});

// routes
app.use("/api/users", require("./routes/UserRoutes"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
