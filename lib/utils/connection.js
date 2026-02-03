const mongoose = require("mongoose");
require("dotenv").config();

console.log("🔗 Connecting to MongoDB...");

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // retry for 10 seconds
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // stop app if DB connection fails
  }
};

// Event listeners (optional but useful for debugging)
mongoose.connection.on("connected", () => {
  console.log("🟢 Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.error("🔴 Mongoose connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("🟡 Mongoose disconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🔴 MongoDB connection closed due to app termination");
  process.exit(0);
});

module.exports = { dbConnection };
