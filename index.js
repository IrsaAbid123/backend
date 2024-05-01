// index.js
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");

require("dotenv").config(); // Load environment variables from .env file

const app = express();

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/quiz", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Middleware
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Import User model
const User = require("./models/User");
const Questions = require("./models/Questions");

const jwtSecret = process.env.JWT_SECRET;

// Register User
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate verification token
    const verificationToken = jwt.sign({ email }, jwtSecret, {
      expiresIn: "1d",
    });

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      verificationToken,
    });
    await newUser.save();

    // Send verification email
    sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: "Please verify your email address" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Send verification email
function sendVerificationEmail(email, token) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "iirsaabid@gmail.com",
      pass: "jdhjhfbxnxclvbtw",
    },
  });

  var mailOptions = {
    from: "iirsaabid@gmail.com",
    to: email,
    subject: "Account Verification",
    text: `
    <p>Hello,</p>
    <p>Thank you for registering. Please click the link below to verify your account:</p>
    <p><a href="http://localhost:5000/api/verify-email/${token}">Verify Email</a></p>
  `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Error sending verification email:", error);
    } else {
      console.log("Verification email sent:", info.response);
    }
  });
}

// Verify Email
app.get("/api/verify-email/:token", async (req, res) => {
  const token = req.params.token;

  try {
    // Verify token
    const payload = jwt.verify(token, jwtSecret);

    // Find user by email
    const user = await User.findOneAndUpdate(
      { email: payload.email },
      { verified: true, verificationToken: null }
    );

    if (!user) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    res.sendFile(path.join(__dirname, "public", "create-profile.html"));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Updating the profile
app.post("/api/update-profile/:userId", async (req, res) => {
  const { name, bio, picture } = req.body;
  const userId = req.params.userId;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user profile
    user.profile = {
      name,
      bio,
      picture,
    };
    await user.save();

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all titles
app.get("/api/titles", async (req, res) => {
  try {
    const titles = await Questions.distinct("title");
    res.json(titles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get categories by title
app.get("/api/categories", async (req, res) => {
  const { title } = req.query;

  try {
    const categories = await Questions.distinct("category", { title });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get questions by title, category, level, and type
app.get("/api/questions", async (req, res) => {
  const { title, category, level } = req.query;

  try {
    const questions = await Questions.find({ title, category, level });
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
