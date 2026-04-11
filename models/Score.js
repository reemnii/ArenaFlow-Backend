const mongoose = require("mongoose");

const setSchema = new mongoose.Schema(
  {
    teamA: { type: Number, required: true, min: 0 },
    teamB: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const scoreSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      unique: true,
    },
    teamAScore: {
      type: Number,
      required: true,
      min: 0,
    },
    teamBScore: {
      type: Number,
      required: true,
      min: 0,
    },
    sets: [setSchema],
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Score", scoreSchema);
