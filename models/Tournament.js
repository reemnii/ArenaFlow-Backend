const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["Indoor", "Beach", "Grass", "Snow"],
      required: true,
    },
    venue: {
      type: String,
      default: "",
      trim: true,
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
      enum: ["draft", "published", "upcoming", "ongoing", "completed"],
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
    format: {
      type: String,
      default: "Single Elimination",
      trim: true,
    },
    volleyballType: {
      type: String,
      enum: ["Indoor", "Beach", "Grass", "Snow"],
      default: "Indoor",
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    skillLevel: {
      type: String,
      default: "Open",
      trim: true,
    },
    genderCategory: {
      type: String,
      default: "Men",
      trim: true,
    },
    visibility: {
      type: String,
      enum: ["Public", "Private"],
      default: "Public",
    },
    bestOf: {
      type: String,
      default: "3 Sets",
      trim: true,
    },
    pointsPerSet: {
      type: Number,
      default: 25,
      min: 1,
    },
    finalSetPoints: {
      type: Number,
      default: 15,
      min: 1,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    additionalRules: {
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
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tournament", tournamentSchema);
