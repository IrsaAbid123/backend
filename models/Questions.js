const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  title: String,
  text: String,
  answerOptions: [String],
  correctOption: String,
  level: String,
  category: String,
  type: String,
});

module.exports = mongoose.model("Question", questionSchema);
