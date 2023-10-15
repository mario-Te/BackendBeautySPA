const jwt = require("jsonwebtoken");
const User = require("../models/User");
module.exports = async function (req, res, next) {
  const accessToken = req.headers.authorization.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({ message: "Access token not provided" });
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_TOKEN_SECRET);

    const user = await User.findOne({ name: decoded.username });

    if (user.Role !== "Admin") {
      throw new Error("User is not an admin");
    }
    next();
  } catch (error) {
    console.error("Error generating access token", error);
    return res.status(403).json({ message: "Invalid access token" });
  }
};
