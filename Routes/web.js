const express = require("express");
const Msg = require("../models/messages");
const router = express.Router();

module.exports = router;
router.get("/messages/all", async (req, res) => {
  try {
    const messages = await Msg.find();
    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch Message data" });
  }
});
router.post("/messages/addmsg", async (req, res) => {
  try {
    const { text, email } = req.body;
    const msg = await Msg({
      text,
      email,
    });
    await msg.save();
    res.status(201).json({ message: "Message sent successful" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Message failed to be sent" });
  }
});
router.delete("/Messages/:id", async (req, res) => {
  try {
    const msgId = req.params.id;

    // Find the appointment by ID
    const message = await Msg.findById(msgId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Delete the appointment
    await message.deleteOne();

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Failed to delete appointment", error);
    res.status(500).json({ message: "Failed to delete appointment" });
  }
});

module.exports = router;
