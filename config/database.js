const mongoose = require("mongoose");
const config = require("./env");

const connectDB = async () => {
  let retries = 5;
  while (retries) {
    try {
      await mongoose.connect(config.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log("MongoDB connected successfully");
      break;
    } catch (err) {
      retries -= 1;
      console.error(
        `MongoDB connection attempt failed. Retries left: ${retries}`
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  if (!retries) {
    console.error("Could not connect to MongoDB. Exiting...");
    process.exit(1);
  }
};

module.exports = { connectDB };
