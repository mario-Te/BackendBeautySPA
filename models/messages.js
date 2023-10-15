const mongoose = require("mongoose");

// User schema
const msgSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    sparse: true,
  },
  text: {
    type: String,
    required: true,
  },
});

// mesg model
const msg = mongoose.model("Msg", msgSchema);

module.exports = msg;
