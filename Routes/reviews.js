const express = require("express");
const multer = require("multer");
const Reviews = require("../models/reviews");
const User = require("../models/User");
const router = express.Router();
const verifyToken = require("./middlware");
const jwt = require("jsonwebtoken");

router.post("/add", verifyToken, async (req, res) => {
  try {
    const { reviewed, reviewText, rating } = req.body;
    const accessToken = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.JWT_TOKEN_SECRET);
    const user = await User.findOne({ name: decoded.username });
    const newReview = new Reviews({
      rate: rating,
      reviewed,
      reviewer: user.name,
      text: reviewText,
    });
    await newReview.save();
    res.status(201).json({ message: "New Review is added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to add review" });
  }
});
router.get("/all", async (req, res) => {
  try {
    const reviews = await Reviews.find();
    const res_reviews = reviews.map((rev) => {
      return {
        _id: rev.id,
        reviewer: rev.reviewer,
        about: rev.reviewed,
        rate: rev.rate,
        text: rev.text,
      };
    });
    res.status(201).json(res_reviews.flat());
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to Fetch reviews" });
  }
});
router.get("/:user", async (req, res) => {
  try {
    const { user } = req.params;
    const reviews = await Reviews.find({ reviewed: user });

    const reviewerNames = reviews.map((review) => review.reviewer);

    const users = await User.find({
      name: { $in: reviewerNames },
    });

    const reviewerData = users.map((user) => {
      const reviewerReview = reviews.filter(
        (review) => review.reviewer === user.name
      );
      return reviewerReview.map((review) => ({
        avatar: user.Image,
        _id: review.id,
        comment: review.text,
        user: user.name,
        date: review.created_at,
        rate: review.rate,
      }));
    });

    res.status(200).json(reviewerData.flat());
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to retrieve reviews" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const rId = req.params.id;

    // Find the Reviews by ID
    const review = await Reviews.findById(rId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Delete the Service
    await review.deleteOne();

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Failed to delete Review", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
});
module.exports = router;
