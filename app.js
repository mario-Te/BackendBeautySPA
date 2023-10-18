const express = require("express");
const cors = require("cors");
require("dotenv").config();
const Authroutes = require("./Routes/auth");
const ServicesRoutes = require("./Routes/Services");
const webRoutes = require("./Routes/web");
const AppointRoutes = require("./Routes/appointments");
const ReviewRoutes = require("./Routes/reviews");
const ConnectDb = require("./db");
const app = express();
const port = 5000; // Choose any port number you prefer

ConnectDb();
app.use(cors());
app.use(express.json());

app.use("/auth", Authroutes);
app.use("/services", ServicesRoutes);
app.use("/o", webRoutes);
app.use("/appointment", AppointRoutes);
app.use("/reviews", ReviewRoutes);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
