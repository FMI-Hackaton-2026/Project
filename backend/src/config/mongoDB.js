import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_DB_URL);
    console.log(`[mongo] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[mongo] Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;