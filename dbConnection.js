const mongoose = require("mongoose");
require("dotenv").config();
const mongoUrl = process.env.MONGO_URL;

const accessDb = async () => {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};

module.exports = accessDb;
