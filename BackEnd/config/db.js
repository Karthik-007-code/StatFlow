import mongoose from "mongoose";

/**
 * Connects to MongoDB using the MONGO_STR environment variable.
 * Exits the process with code 1 if the connection fails.
 */
const connectDB = async () => {
  try {

    const conn = await mongoose.connect(process.env.MONGO_STR, {
      dbName: "statflow",
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
