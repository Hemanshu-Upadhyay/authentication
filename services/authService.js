const User = require("../models/User");
const { generateAuthTokens } = require("../utils/jwt");
const config = require("../config/env");

class AuthService {
  static async signup(email, password) {
    const user = await User.create({ email, password });
    user.password = undefined;
    return user;
  }

  static async login(email, password) {
    const user = await User.findOne({ email }).select(
      "+password +failedLoginAttempts +lockUntil +active"
    );

    if (!user || !user.active) {
      throw new Error("Invalid credentials");
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      throw new Error("Account is temporarily locked");
    }

    const validPassword = await user.comparePassword(password);

    if (!validPassword) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
      }

      await user.save();
      throw new Error("Invalid credentials");
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    const { accessToken, refreshToken } = generateAuthTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    return { user, accessToken, refreshToken };
  }

  static async refreshToken(refreshToken) {
    const user = await User.findOne({
      refreshToken,
      active: true,
    });

    if (!user) {
      throw new Error("Invalid refresh token");
    }

    const { accessToken } = generateAuthTokens(user._id);
    return { accessToken };
  }

  static async logout(userId) {
    await User.updateOne(
      { _id: userId },
      {
        $unset: { refreshToken: "" },
        $currentDate: { updatedAt: true },
      }
    );
  }
}

module.exports = AuthService;
