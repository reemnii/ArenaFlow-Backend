const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Indoor", "Beach", "Snow"],
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
    registrationStatus: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    prize: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: "",
    },
    maxTeams: {
      type: Number,
      required: true,
      min: 2,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tournament", tournamentSchema);
