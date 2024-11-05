const express = require("express");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const config = require("./config/env");
const { authLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth");

const app = express();

app.use(helmet());
app.use(mongoSanitize());
app.use(
  cors({
    origin: config.ALLOWED_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

if (config.NODE_ENV === "production") {
  app.use(morgan("combined"));
}

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use("/auth", authLimiter, authRoutes);

app.use(errorHandler);

module.exports = app;
