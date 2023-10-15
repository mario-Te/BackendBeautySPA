const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const accessToken = req.headers.authorization.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({ message: "Access token not provided" });
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_TOKEN_SECRET);
    req.user = decoded.username; // Store the username in the request object
    next();
  } catch (error) {
    console.error("Error generating access token", error);
    return res.status(403).json({ message: "Invalid access token" });
  }
};
