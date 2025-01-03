const mongoose = require("mongoose");

const connectDb = async () => {
  // Set up the event listener first
  mongoose.connection.on("connected", () => {
    console.log("Database connected successfully");
  });

  try {
    // Connect to the database
    await mongoose.connect(`${process.env.MONGODB_URL}/mern-auth`);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); // Exit the process with an error code
  }
};

module.exports = connectDb;
