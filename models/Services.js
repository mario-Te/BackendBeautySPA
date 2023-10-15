const mongoose = require("mongoose");

// User schema
const ServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    sparse: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

// Service model
const Services = mongoose.model("Services", ServiceSchema);

module.exports = Services;
