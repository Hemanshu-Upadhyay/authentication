const express = require("express");
const router = express.Router();
const AuthService = require("../services/authService");
const { validateSignup, validateLogin } = require("../utils/validation");
const { authenticateToken } = require("../middleware/auth");
const config = require("../config/env");

router.post("/signup", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const errors = validateSignup({ email, password });
    if (errors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors,
      });
    }

    const user = await AuthService.signup(email, password);

    res.status(201).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const errors = validateLogin({ email, password });
    if (errors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors,
      });
    }

    const { user, accessToken, refreshToken } = await AuthService.login(
      email,
      password
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: config.COOKIE_DOMAIN,
      path: "/auth/refresh-token",
    });

    res.json({
      status: "success",
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/refresh-token", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        status: "error",
        message: "Refresh token required",
      });
    }

    const { accessToken } = await AuthService.refreshToken(refreshToken);

    res.json({
      status: "success",
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", authenticateToken, async (req, res, next) => {
  try {
    await AuthService.logout(req.user._id);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      domain: config.COOKIE_DOMAIN,
      path: "/auth/refresh-token",
    });

    res.json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
