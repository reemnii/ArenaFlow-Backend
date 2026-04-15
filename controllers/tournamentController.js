const Tournament = require("../models/Tournament");
const mongoose = require("mongoose");

const populateFields = ["teams", "createdBy"];
const tournamentTypes = ["Indoor", "Beach", "Grass", "Snow"];
const tournamentStatuses = ["draft", "published", "upcoming", "ongoing", "completed"];
const registrationStatuses = ["open", "closed"];
const visibilityOptions = ["Public", "Private"];

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

const createValidationError = (errors) => {
  const error = createError("Tournament validation failed", 400);
  error.errors = errors;
  return error;
};

const canManageTournament = (user, tournament) => {
  if (!user || !tournament) {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  if (!tournament.createdBy) {
    return false;
  }

  return String(tournament.createdBy) === String(user._id);
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

const isBlank = (value) => value === undefined || value === null || String(value).trim() === "";

const escapeRegExp = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const normalizeObjectIdList = (value, errors) => {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    errors.push("Teams must be an array of valid team IDs.");
    return undefined;
  }

  const invalidIds = value.filter((id) => !mongoose.Types.ObjectId.isValid(id));

  if (invalidIds.length > 0) {
    errors.push("Teams contains one or more invalid team IDs.");
    return undefined;
  }

  return value;
};

const normalizeTournamentPayload = (body, user) => {
  const payload = { ...body };
  const errors = [];

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

  const teams = normalizeObjectIdList(payload.teams || payload.teamIds, errors);
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

  return { payload, errors };
};

const validateTournamentPayload = (payload, options = {}) => {
  const { isCreate = false, existingTournament = null } = options;
  const errors = [];

  if (isCreate) {
    if (isBlank(payload.name)) errors.push("Name is required.");
    if (isBlank(payload.type)) errors.push("Type is required.");
    if (isBlank(payload.location)) errors.push("Location is required.");
    if (isBlank(payload.date)) errors.push("Date is required.");
    if (isBlank(payload.maxTeams)) errors.push("Max teams is required.");
  }

  if (payload.name !== undefined && isBlank(payload.name)) {
    errors.push("Name cannot be empty.");
  }

  if (payload.location !== undefined && isBlank(payload.location)) {
    errors.push("Location cannot be empty.");
  }

  if (payload.type !== undefined && !tournamentTypes.includes(payload.type)) {
    errors.push(`Type must be one of: ${tournamentTypes.join(", ")}.`);
  }

  if (
    payload.volleyballType !== undefined &&
    !tournamentTypes.includes(payload.volleyballType)
  ) {
    errors.push(`Volleyball type must be one of: ${tournamentTypes.join(", ")}.`);
  }

  if (payload.status !== undefined && !tournamentStatuses.includes(payload.status)) {
    errors.push(`Status must be one of: ${tournamentStatuses.join(", ")}.`);
  }

  if (
    payload.registrationStatus !== undefined &&
    !registrationStatuses.includes(payload.registrationStatus)
  ) {
    errors.push(`Registration status must be one of: ${registrationStatuses.join(", ")}.`);
  }

  if (payload.visibility !== undefined && !visibilityOptions.includes(payload.visibility)) {
    errors.push(`Visibility must be one of: ${visibilityOptions.join(", ")}.`);
  }

  ["date", "startDate", "endDate"].forEach((field) => {
    if (payload[field] !== undefined && Number.isNaN(new Date(payload[field]).getTime())) {
      errors.push(`${field} must be a valid date.`);
    }
  });

  if (
    payload.startDate !== undefined &&
    payload.endDate !== undefined &&
    !Number.isNaN(new Date(payload.startDate).getTime()) &&
    !Number.isNaN(new Date(payload.endDate).getTime()) &&
    new Date(payload.endDate) < new Date(payload.startDate)
  ) {
    errors.push("End date cannot be before start date.");
  }

  if (payload.maxTeams !== undefined) {
    if (!Number.isInteger(payload.maxTeams) || payload.maxTeams < 2) {
      errors.push("Max teams must be a whole number of at least 2.");
    }
  }

  if (payload.prize !== undefined && (typeof payload.prize !== "number" || payload.prize < 0)) {
    errors.push("Prize must be a non-negative number.");
  }

  if (
    payload.pointsPerSet !== undefined &&
    (!Number.isInteger(payload.pointsPerSet) || payload.pointsPerSet < 1)
  ) {
    errors.push("Points per set must be a whole number of at least 1.");
  }

  if (
    payload.finalSetPoints !== undefined &&
    (!Number.isInteger(payload.finalSetPoints) || payload.finalSetPoints < 1)
  ) {
    errors.push("Final set points must be a whole number of at least 1.");
  }

  const teamCount =
    payload.teams !== undefined
      ? payload.teams.length
      : existingTournament && existingTournament.teams
        ? existingTournament.teams.length
        : 0;
  const maxTeams =
    payload.maxTeams !== undefined
      ? payload.maxTeams
      : existingTournament
        ? existingTournament.maxTeams
        : undefined;

  if (maxTeams !== undefined && teamCount > maxTeams) {
    errors.push("Max teams cannot be less than the number of assigned teams.");
  }

  return errors;
};

const ensureUniqueTournamentName = async (name, tournamentId = null) => {
  if (isBlank(name)) {
    return null;
  }

  const query = {
    name: new RegExp(`^${escapeRegExp(name.trim())}$`, "i"),
  };

  if (tournamentId) {
    query._id = { $ne: tournamentId };
  }

  const existingTournament = await Tournament.findOne(query).select("_id");
  return existingTournament ? "A tournament with this name already exists." : null;
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
    const { payload, errors } = normalizeTournamentPayload(req.body, req.user);
    errors.push(...validateTournamentPayload(payload, { isCreate: true }));

    const duplicateNameError = await ensureUniqueTournamentName(payload.name);
    if (duplicateNameError) {
      errors.push(duplicateNameError);
    }

    if (errors.length > 0) {
      return next(createValidationError(errors));
    }

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

    const { payload, errors } = normalizeTournamentPayload(req.body, req.user);
    const existingTournament = await Tournament.findById(req.params.id);

    if (!existingTournament) {
      return next(createError("Tournament not found", 404));
    }

    if (!canManageTournament(req.user, existingTournament)) {
      return next(createError("Not authorized to update this tournament", 403));
    }

    delete payload.createdBy;

    errors.push(...validateTournamentPayload(payload, { existingTournament }));

    const duplicateNameError = await ensureUniqueTournamentName(payload.name, req.params.id);
    if (duplicateNameError) {
      errors.push(duplicateNameError);
    }

    if (errors.length > 0) {
      return next(createValidationError(errors));
    }

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

    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return next(createError("Tournament not found", 404));
    }

    if (!canManageTournament(req.user, tournament)) {
      return next(createError("Not authorized to delete this tournament", 403));
    }

    await tournament.deleteOne();

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
