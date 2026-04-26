const Team = require("../models/Team");
const Player = require("../models/Player");
const Tournament = require("../models/Tournament");
const Match = require("../models/Match");
const Score = require("../models/Score");
const mongoose = require("mongoose");
const createCrudController = require("./crudController");

const baseController = createCrudController(Team, ["createdBy"]);

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const canManageTeam = (user, team) => {
  if (!user || !team) {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  return String(team.createdBy) === String(user._id);
};

const create = async (req, res, next) => {
  try {
    const item = await Team.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json(item);
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createError("Invalid team id", 400));
    }

    const existingTeam = await Team.findById(req.params.id);

    if (!existingTeam) {
      return next(createError("Team not found", 404));
    }

    if (!canManageTeam(req.user, existingTeam)) {
      return next(createError("Not authorized to update this team", 403));
    }

    const updates = { ...req.body };
    delete updates.createdBy;
    delete updates._id;
    delete updates.id;

    const updatedTeam = await Team.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("createdBy");

    res.json(updatedTeam);
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createError("Invalid team id", 400));
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return next(createError("Team not found", 404));
    }

    if (!canManageTeam(req.user, team)) {
      return next(createError("Not authorized to delete this team", 403));
    }

    const matches = await Match.find({
      $or: [{ teamA: team._id }, { teamB: team._id }],
    }).select("_id");

    const matchIds = matches.map((match) => match._id);

    const [deletedPlayers, tournamentUpdateResult, deletedScores, deletedMatches] =
      await Promise.all([
        Player.deleteMany({ team: team._id }),
        Tournament.updateMany({ teams: team._id }, { $pull: { teams: team._id } }),
        matchIds.length > 0
          ? Score.deleteMany({ match: { $in: matchIds } })
          : Promise.resolve({ deletedCount: 0 }),
        Match.deleteMany({
          $or: [{ teamA: team._id }, { teamB: team._id }],
        }),
      ]);

    await team.deleteOne();

    res.json({
      message: "Team and related records deleted",
      deletedPlayers: deletedPlayers.deletedCount || 0,
      updatedTournaments: tournamentUpdateResult.modifiedCount || 0,
      deletedMatches: deletedMatches.deletedCount || 0,
      deletedScores: deletedScores.deletedCount || 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  ...baseController,
  create,
  update,
  remove,
};
