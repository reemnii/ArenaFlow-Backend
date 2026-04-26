const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "coach", "player", "manager"],
      default: "player",
    },
    avatar: {
      type: String,
      default: "",
    },
    fullName: {
      type: String,
      default: "",
      trim: true,
    },
    teamName: {
      type: String,
      default: "",
      trim: true,
    },
    position: {
      type: String,
      default: "",
      trim: true,
    },
    jerseyNumber: {
      type: Number,
      min: 0,
      max: 99,
    },
    gender: {
      type: String,
      enum: ["male", "female", ""],
      default: "",
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    age: {
      type: Number,
      min: 0,
    },
    yearsExperience: {
      type: Number,
      min: 0,
    },
    specialization: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
