import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "./config/.env" });

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "arenaflow", // ensures correct DB
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);

    // optional: show hint for common mistakes
    if (error.message.includes("bad auth")) {
      console.error("👉 Check your MongoDB username/password");
    }

    process.exit(1);
  }
};

export default connectDB;
