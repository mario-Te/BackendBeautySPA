const mongoose = require("mongoose");

// User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    sparse: true,
  },
  password: {
    type: String,
    required: true,
  },
  Role: {
    type: String,
    required: true,
    default: "User",
  },
  Bio: {
    type: String,
  },
  speclization: {
    type: String,
  },
  Image: {
    type: String,
  },
});

// User model
const User = mongoose.model("User", userSchema);

module.exports = User;
