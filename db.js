const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const url =
      "mongodb+srv://marios:p9RLiv3tAL7f2UFx@mongocluster.xzlgpnj.mongodb.net/nodejs?retryWrites=true&w=majority";
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(url, options);
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

module.exports = connectDB;
