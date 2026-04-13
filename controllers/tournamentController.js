const Tournament = require("../models/Tournament");
const mongoose = require("mongoose");

const populateFields = ["teams", "createdBy"];

const applyPopulate = (query) => {
  populateFields.forEach((field) => {
    query.populate(field);
  });

  return query;
};

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeStatus = (status) => {
  if (!status) {
    return undefined;
  }

  const normalized = String(status).toLowerCase();

  if (normalized === "live") {
    return "ongoing";
  }

  if (normalized === "published") {
    return "upcoming";
  }

  if (["draft", "upcoming", "ongoing", "completed"].includes(normalized)) {
    return normalized;
  }

  return status;
};

const parsePrize = (prize) => {
  if (prize === undefined || prize === null || prize === "") {
    return prize;
  }

  if (typeof prize === "number") {
    return prize;
  }

  const numericPrize = Number(String(prize).replace(/[^0-9.-]/g, ""));
  return Number.isNaN(numericPrize) ? prize : numericPrize;
};

const normalizeObjectIdList = (value) => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter((id) => mongoose.Types.ObjectId.isValid(id));
};

const normalizeTournamentPayload = (body, user) => {
  const payload = { ...body };

  delete payload.id;
  delete payload._id;

  if (payload.volleyballType && !payload.type) {
    payload.type = payload.volleyballType;
  }

  if (payload.type && !payload.volleyballType) {
    payload.volleyballType = payload.type;
  }

  if (payload.startDate && !payload.date) {
    payload.date = payload.startDate;
  }

  if (payload.date && !payload.startDate) {
    payload.startDate = payload.date;
  }

  if (payload.refustrationstatus && !payload.registrationStatus) {
    payload.registrationStatus = payload.refustrationstatus;
  }

  delete payload.refustrationstatus;

  const status = normalizeStatus(payload.status);
  if (status) {
    payload.status = status;
  }

  if (payload.prize !== undefined) {
    payload.prize = parsePrize(payload.prize);
  }

  if (payload.maxTeams !== undefined) {
    payload.maxTeams = Number(payload.maxTeams);
  }

  if (payload.pointsPerSet !== undefined) {
    payload.pointsPerSet = Number(payload.pointsPerSet);
  }

  if (payload.finalSetPoints !== undefined) {
    payload.finalSetPoints = Number(payload.finalSetPoints);
  }

  const teams = normalizeObjectIdList(payload.teams || payload.teamIds);
  if (teams) {
    payload.teams = teams;
  }
  delete payload.teamIds;

  if (user && user._id) {
    payload.createdBy = user._id;
  }

  if (payload.createdBy && !mongoose.Types.ObjectId.isValid(payload.createdBy)) {
    delete payload.createdBy;
  }

  return payload;
};

const getAll = async (req, res, next) => {
  try {
    const tournaments = await applyPopulate(Tournament.find().sort({ createdAt: -1 }));
    res.json(tournaments);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createError("Invalid tournament id", 400));
    }

    const tournament = await applyPopulate(Tournament.findById(req.params.id));

    if (!tournament) {
      return next(createError("Tournament not found", 404));
    }

    res.json(tournament);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const payload = normalizeTournamentPayload(req.body, req.user);
    const tournament = await Tournament.create(payload);
    const populatedTournament = await applyPopulate(Tournament.findById(tournament._id));

    res.status(201).json(populatedTournament);
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createError("Invalid tournament id", 400));
    }

    const payload = normalizeTournamentPayload(req.body, req.user);
    const tournament = await applyPopulate(
      Tournament.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true,
      })
    );

    if (!tournament) {
      return next(createError("Tournament not found", 404));
    }

    res.json(tournament);
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createError("Invalid tournament id", 400));
    }

    const tournament = await Tournament.findByIdAndDelete(req.params.id);

    if (!tournament) {
      return next(createError("Tournament not found", 404));
    }

    res.json({ message: "Tournament deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
