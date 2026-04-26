const express = require("express");
require("./config/env");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;
const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, "");
const allowedOrigins = (
  process.env.CLIENT_ORIGIN || "https://arena-flow-coral.vercel.app"
)
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

// connect database
connectDB();

// middleware
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  const normalizedRequestOrigin = requestOrigin
    ? normalizeOrigin(requestOrigin)
    : "";

  if (!requestOrigin || allowedOrigins.includes(normalizedRequestOrigin)) {
    res.header("Access-Control-Allow-Origin", requestOrigin || "*");
  }

  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("Referrer-Policy", "no-referrer");
  res.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.header("Cross-Origin-Resource-Policy", "same-site");

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
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/teams", require("./routes/teamRoutes"));
app.use("/api/players", require("./routes/playerRoutes"));
app.use("/api/tournaments", require("./routes/tournamentRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/scores", require("./routes/scoreRoutes"));


app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Base URL: http://localhost:${PORT}`);
});
