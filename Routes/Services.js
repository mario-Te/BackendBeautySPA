const express = require("express");
const multer = require("multer");
const Service = require("../models/Services");
const router = express.Router();
const verifyAdmin = require("./adminMiddleware");
const fs = require("fs");
const path = require("path");
router.delete("/:id", async (req, res) => {
  try {
    const serviceId = req.params.id;

    // Find the Service by ID
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Delete the Service
    await service.deleteOne();

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Failed to delete service", error);
    res.status(500).json({ message: "Failed to delete service" });
  }
});
router.get("/all", async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    console.error("Error fetching services", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});
router.get("/:title", async (req, res) => {
  try {
    const { title } = req.params;
    const service = await Service.findOne({ title: title });
    res.json(service);
  } catch (error) {
    console.error("Error fetching service", error);
    res.status(500).json({ error: "Failed to fetch service" });
  }
});

const upload = multer({ dest: "uploads/" });

router.post("/add", verifyAdmin, upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return;
  }

  try {
    const { description, price, title, summary } = req.body;

    const newService = new Service({
      image: handleFile(req.file),
      description,
      price,
      summary,
      title,
    });
    await newService.save();
    res.status(201).json({ message: "New Service is added" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});
router.put("/:title", verifyAdmin, upload.single("file"), async (req, res) => {
  try {
    const { title } = req.params;
    const { description, price, summary } = req.body;
    const newtitle = req.body.title;
    const service = await Service.findOne({ title: title });
    const result = await Service.updateOne(
      { title: title },
      {
        $set: {
          image: req.file ? handleFile(req.file) : service.image,
          title: newtitle ? newtitle : service.title,
          description: description ? description : service.description,
          price: price ? price : service.price,
          summary: summary ? summary : service.summary,
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
    res.status(500).json({ error: "Failed to fetch service" });
  }
});

module.exports = router;
const handleFile = (file) => {
  const destinationFolder = "../../PP/Client/public/images/services"; // Specify the destination folder here
  const { filename, originalname, path: filePath } = file;
  // Create the destination folder if it doesn't exist
  if (!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder);
  }
  // Get the file extension from the original file name
  const fileExtension = path.extname(originalname);
  // Generate a new file name with the original extension
  const newFileName = `${filename}${fileExtension}`;
  // Move the file to the destination folder with the new file name
  const newFilePath = path.join(destinationFolder, newFileName);
  fs.renameSync(filePath, newFilePath);

  return newFileName;
};
