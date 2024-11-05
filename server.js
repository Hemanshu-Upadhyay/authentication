const app = require("./app");
const config = require("./config/env");
const { connectDB } = require("./config/database");

connectDB();

// Start server
const server = app.listen(config.PORT, () => {
  console.log(
    `Server running in ${config.NODE_ENV} mode on port ${config.PORT}`
  );
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  await mongoose.connection.close();
  server.close(() => {
    process.exit(0);
  });
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(err);

  server.close(() => {
    process.exit(1);
  });
});
