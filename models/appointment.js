const mongoose = require("mongoose");

// Appointmetn schema
const appointmentSchema = new mongoose.Schema({
  Username: {
    type: String,
    required: true,
  },
  ServiceName: {
    type: String,
    required: true,
  },
  date: {
    type: Object,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "pending",
  },
  expert: {
    type: String,
  },
  Cost: {
    type: Number,
    required: true,
  },
  isExternal: {
    type: Boolean,
    required: true,
  },
});

// appointment model
const appointment = mongoose.model("appointment", appointmentSchema);

module.exports = appointment;
