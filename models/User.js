// models/User.js
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  bio: {
    type: String,
  },
  picture: {
    type: String,
  },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  profile: profileSchema,
});

module.exports = mongoose.model("User", userSchema);
