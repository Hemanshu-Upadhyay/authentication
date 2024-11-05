const { verifyToken } = require("../utils/jwt");
const config = require("../config/env");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    const decoded = verifyToken(token, config.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("+active");

    if (!user || !user.active) {
      return res.status(401).json({
        status: "error",
        message: "User no longer exists or is deactivated",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token expired",
      });
    }
    next(error);
  }
};

module.exports = { authenticateToken };
