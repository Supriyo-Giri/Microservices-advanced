import mongoose from "mongoose";
import logger from "./logger.js";
import ENV from "./env.js";

export const connectDb = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI);
    logger.info(`Successfully connected to database: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Unable to connect to mongodb: ${error}`);
    process.exit(1);
  }
};
