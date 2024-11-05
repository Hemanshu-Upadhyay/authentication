const jwt = require("jsonwebtoken");
const config = require("../config/env");

const signToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: "HS512",
  });
};

const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

module.exports = {
  signToken,
  verifyToken,
  generateAuthTokens: (userId) => ({
    accessToken: signToken({ userId }, config.JWT_SECRET, "15m"),
    refreshToken: signToken({ userId }, config.JWT_REFRESH_SECRET, "7d"),
  }),
};
