const express = require("express");
const appointment = require("../models/appointment");
const router = express.Router();
const verifyToken = require("./middlware");
const verifyAdmin = require("./adminMiddleware");
const Service = require("../models/Services");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
router.get("/all", async (req, res) => {
  try {
    const events = await appointment.find();
    res.json(events);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch Appointment data" });
  }
});
function getRandomColor() {
  // Generate random values for RGB channels
  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);

  // Create the color string in hexadecimal format
  const color = `#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`;

  return color;
}
router.get("/myappointment", verifyToken, async (req, res) => {
  try {
    const accessToken = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.JWT_TOKEN_SECRET);
    const user = await User.findOne({ name: decoded.username });
    let events;
    if (user.Role === "User")
      events = await appointment.find({ Username: user.name });
    else events = await appointment.find({ expert: user.name });
    let color = "",
      text = "";

    const res_event = events.map((event) => {
      if (event.status.toLowerCase() == "pending") {
        color = "#dddddd";
        text = "Thank you for your passion , we are still scheduling our dates";
      } else if (event.status.toLowerCase() == "rejected") {
        color = "#ff0000";
        text = "Sorry, the service isn't available that time";
      } else {
        color = "#00ff00";
        if (user.Role === "Employee") {
          text =
            "You have session with " +
            event.Username.toString() +
            " at " +
            event.date.toString().split("T")[1].slice(0, 8);
        } else
          text =
            "Horray, the session is supervised by " + event.expert.toString();
      }

      return {
        _id: event.id,
        title: event.ServiceName,
        date: event.date,
        popupContent: text,
        color,
      };
    });

    res.status(201).json(res_event.flat());
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch Events data" });
  }
});
router.put("/updatestatus", verifyAdmin, async (req, res) => {
  const { expert, isconfirmed, id } = req.body;
  try {
    const result = await appointment.updateOne(
      { _id: id.toString() }, // Use _id instead of id
      {
        $set: {
          expert: !isconfirmed ? "" : expert,
          status: !isconfirmed ? "Rejected" : "Confirmed",
        },
      }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Document updated successfully" });
    } else {
      res.status(404).json({ error: "Document not found" });
    }
  } catch (error) {
    console.error("Error fetching service", error);
    res.status(500).json({ error: "Failed to update service" });
  }
});
// Middleware function to verify the access token

router.post("/add", verifyToken, async (req, res) => {
  try {
    const { Username, address, date, isExternal, serviceName } = req.body;
    const service = await Service.findOne({ title: serviceName });
    if (service) {
      const fee = isExternal ? service.price * 1.1 : service.price;
      const newappointment = new appointment({
        date,
        address,
        isExternal,
        Cost: fee,
        Username,
        ServiceName: serviceName,
      });
      await newappointment.save();
      res.status(201).json({
        message: "Appointment added successfully ",
      });
    }
  } catch (error) {
    console.error("Error adding An appointment", error);
    res.status(500).json({ error: "Failed to add appointment" });
  }
});
router.post("/add4", verifyAdmin, async (req, res) => {
  try {
    const { Username, address, isExternal, serviceName, date } = req.body;
    const service = await Service.findOne({ title: serviceName });
    if (service) {
      const fee = isExternal ? service.price * 1.1 : service.price;
      const newappointment = new appointment({
        date,
        address,
        isExternal,
        Cost: fee,
        Username,
        ServiceName: serviceName,
      });
      await newappointment.save();
      res.status(201).json({
        message: "Appointment added successfully",
      });
    }
  } catch (error) {
    console.error("Error adding An appointment", error);
    res.status(500).json({ error: "Failed to add appointment" });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const appointmentId = req.params.id;

    // Find the appointment by ID
    const event = await appointment.findById(appointmentId);

    if (!event) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Delete the appointment
    await event.deleteOne();

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Failed to delete appointment", error);
    res.status(500).json({ message: "Failed to delete appointment" });
  }
});

module.exports = router;
