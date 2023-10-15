const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const verifyToken = require("./middlware");
router.get("/emps/:servicename", async (req, res) => {
  try {
    const { servicename } = req.params;
    const Users = await User.find({
      speclization: servicename,
    });
    //const Users = await User.find();
    res.json(Users.map((user) => user.name));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});
router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ name: username });
    if (existingUser) {
      throw new Error("User already exists");
    }
    const existingmail = await User.findOne({ email: email });
    if (existingmail) {
      throw new Error("Email already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name: username,
      password: hashedPassword,
      email,
    });
    await newUser.save();
    const accessToken = jwt.sign({ username }, process.env.JWT_TOKEN_SECRET);

    res.status(201).json({
      message: "Registration successful",
      accessToken: accessToken,
      Username: newUser.name,
      role: newUser.Role,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed", error: error.toString() });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ name: username });

    if (!user) {
      throw new Error("User doesn't exist");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Wrong Credntial");
    }

    // Generate and send access token
    const accessToken = jwt.sign({ username }, process.env.JWT_TOKEN_SECRET);

    res.status(200).json({
      message: "Login successful",
      accessToken: accessToken,
      Username: user.name,
      role: user.Role,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging in", error: error.toString() });
  }
});
router.post("/checkAdmin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ name: username });

    if (!user) {
      throw new Error("User doesn't exist");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Wrong Credntial");
    }
    if (user.Role == "Admin")
      res.status(200).json({
        message: "Admin successful",
        isAdmin: true,
      });
    else
      res.status(401).json({
        message: "unAuthorized",
        isAdmin: false,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging in", error: error.toString() });
  }
});
router.get("/allUserNames", async (req, res) => {
  try {
    const Users = await User.find({ Role: "User" });
    res.json(Users.map((user) => user.name));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});
router.get("/all", async (req, res) => {
  try {
    const Users = await User.find({ Role: { $in: ["Employee", "User"] } });
    //const Users = await User.find();
    res.json(Users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});
router.get("/services/:title", async (req, res) => {
  const { title } = req.params;
  try {
    const Users = await User.find({ speclization: title });
    //const Users = await User.find();
    const emps = Users.map((user) => {
      return {
        id: user._id,
        img: user.Image,
        name: user.name,
        bio: user.Bio,
        specializaion: user.speclization,
      };
    });
    res.status(201).json(emps.flat());
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationFolder = "../../PP/Client/public/images/users"; // Specify the destination folder here
    cb(null, destinationFolder);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });
router.post("/addUser", upload.single("file"), async (req, res) => {
  try {
    const { userName, email, role, password, bio, speclization } = req.body;
    const file = req.file;

    // Perform validation and save user to the database
    // Replace this with your actual logic
    const hashedPassword = await bcrypt.hash(password, 10);

    // Example response
    if (userName && email && role && password && speclization && bio) {
      const user = new User({
        name: userName,
        email,
        Role: role,
        password: hashedPassword,
        Bio: bio,
        speclization,
        Image: file ? file.filename : null,
      });

      // Save the user to the database or perform any other desired actions
      await user.save();
      res.status(200).json({ message: "User added successfully", user });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to add new user" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const UserId = req.params.id;

    // Find the User by ID
    const user = await User.findById(UserId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the Service
    await user.deleteOne();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Failed to delete User", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});
router.get("/:user", async (req, res) => {
  try {
    const { user } = req.params;
    let accessToken = "";
    let isSame = false;

    try {
      accessToken = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(accessToken, process.env.JWT_TOKEN_SECRET);
      const user2 = await User.findOne({ name: decoded.username });

      if (user2.name === user) {
        isSame = true;
      }
    } catch {}
    const UrlUser = await User.findOne({ name: user });
    res.status(200).json({
      email: UrlUser.email,
      bio: UrlUser.Bio,
      speclization: UrlUser.speclization,
      Image: UrlUser.Image,
      Role: UrlUser.Role,
      isSame,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user data" });
    console.log(error);
  }
});
router.post(
  "/updateProfile",
  upload.single("file"),
  verifyToken,
  async (req, res) => {
    try {
      const { password, bio, speclization } = req.body;
      var objForUpdate = {};

      // Perform validation and save user to the database

      const accessToken = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(accessToken, process.env.JWT_TOKEN_SECRET);
      const user = await User.findOne({ name: decoded.username });
      const passwordMatch = await bcrypt.compare(password, user.password);
      // Error confirming old password
      if (!passwordMatch) {
        res.status(402).json({ error: "Passwords don't match" });
      } else {
        const result = await User.updateOne(
          { name: user.name },
          {
            $set: {
              Bio: bio ? bio : user.Bio,
              Image: req.file ? req.file.filename : user.Image,
              speclization: speclization ? speclization : user.speclization,
            },
          }
        );

        if (result.modifiedCount > 0) {
          res.status(200).json({ message: "Document updated successfully" });
        } else {
          res.status(404).json({ error: "Document not found" });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to add new user" });
    }
  }
);
router.put(
  "/updatepassword",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    try {
      const { oldpassword, newpassword } = req.body;
      const accessToken = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(accessToken, process.env.JWT_TOKEN_SECRET);
      const user2 = await User.findOne({ name: decoded.username });
      const passwordMatch = await bcrypt.compare(oldpassword, user2.password);
      if (!passwordMatch) {
        res.status(402).json({ error: "Password Dosen't match" });
      }
      const result = await User.updateOne(
        { name: user2.name },
        {
          $set: {
            password: await bcrypt.hash(newpassword, 10),
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
  }
);
module.exports = router;
