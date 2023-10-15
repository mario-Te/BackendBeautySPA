const mongoose = require("mongoose");

// User schema
const ReviewsSchema = new mongoose.Schema({
  reviewed: {
    type: String,
    required: true,
  },
  reviewer: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
});

// Reviews model
const Reviews = mongoose.model("Reviews", ReviewsSchema);

module.exports = Reviews;
