const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: "./config/.env" });

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/arenaflow";

    const conn = await mongoose.connect(mongoURI, {
      dbName: "arenaflow",
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);

    if (error.message.includes("bad auth")) {
      console.error("👉 Check your MongoDB Atlas username/password");
    }

    process.exit(1);
  }
};

module.exports = connectDB;
