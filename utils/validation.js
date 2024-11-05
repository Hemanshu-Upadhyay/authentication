const validator = require("validator");

module.exports = {
  validateSignup: ({ email, password }) => {
    const errors = [];

    if (!email || !validator.isEmail(email)) {
      errors.push("Valid email is required");
    }

    if (!password || password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    return errors;
  },

  validateLogin: ({ email, password }) => {
    const errors = [];

    if (!email || !password) {
      errors.push("Email and password are required");
    }

    return errors;
  },
};
