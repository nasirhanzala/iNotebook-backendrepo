const mongoose = require("mongoose");

const connectToMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error(error);
  }
};

module.exports = connectToMongo;