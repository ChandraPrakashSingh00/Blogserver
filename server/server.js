const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { sequelize } = require("./models");
const errorHandler = require("./middleware/errorHandler");

// Routes
const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");
const commentRoutes = require("./routes/comments");
const userRoutes = require("./routes/users");

const app = express();

/* ===============================
   SECURITY MIDDLEWARE
================================ */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ===============================
   RATE LIMITING (PROD ONLY)
================================ */
if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api", limiter);
}

/* ===============================
   BODY PARSER
================================ */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ===============================
   ROUTES
================================ */
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);

/* ===============================
   HEALTH CHECK
================================ */
app.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      success: true,
      message: "Server & database running",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Database connection failed",
      database: "disconnected",
      error: error.message,
    });
  }
});

/* ===============================
   ERROR HANDLING
================================ */
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

/* ===============================
   DATABASE INIT (SAFE)
================================ */
const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const isProd = process.env.NODE_ENV === "production";
    await sequelize.sync({ alter: !isProd });

    console.log("✅ Database synced");
  } catch (error) {
    console.error("❌ Database error:", error);
  }
};

initDB();

/* ===============================
   SERVER START (LOCAL ONLY)
================================ */
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
