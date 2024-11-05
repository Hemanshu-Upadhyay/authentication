const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Validation Error",
      details: err.message,
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      status: "error",
      message: "Duplicate key error",
      details: "A record with this value already exists",
    });
  }

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};

module.exports = errorHandler;
