const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const path = require("path");

require("../config/env");

const Team = require("../models/Team");
const Tournament = require("../models/Tournament");
const User = require("../models/User");

const teams = require(path.join(__dirname, "phase1-data", "teams.json"));
const tournaments = require(path.join(__dirname, "phase1-data", "tournaments.json"));

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/arenaflow";
const seedUserEmail = process.env.SEED_USER_EMAIL || "seed@arenaflow.local";
const seedUserPassword = process.env.SEED_USER_PASSWORD || "arenaflow-seed";

const parsePrize = (value) => {
  if (typeof value === "number") {
    return value;
  }

  const parsed = Number(String(value || "").replace(/[^0-9.-]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizeStatus = (status) => {
  const normalized = String(status || "upcoming").toLowerCase();

  if (normalized === "live") {
    return "ongoing";
  }

  if (normalized === "published") {
    return "upcoming";
  }

  return ["draft", "upcoming", "ongoing", "completed"].includes(normalized)
    ? normalized
    : "upcoming";
};

const getSeedUser = async () => {
  const existingUser = await User.findOne({ email: seedUserEmail });

  if (existingUser) {
    return existingUser;
  }

  const hashedPassword = await bcrypt.hash(seedUserPassword, 10);

  return User.create({
    username: "ArenaFlow Seeder",
    email: seedUserEmail,
    password: hashedPassword,
    role: "admin",
  });
};

const seedTeams = async (createdBy) => {
  const teamIdMap = new Map();

  for (const team of teams) {
    const savedTeam = await Team.findOneAndUpdate(
      { name: team.name, gender: team.gender },
      {
        name: team.name,
        gender: team.gender,
        coachName: team.coachName || "",
        city: team.city || "",
        logo: team.logo || "",
        createdBy,
      },
      {
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
        upsert: true,
      }
    );

    teamIdMap.set(team.phase1Id, savedTeam._id);
  }

  return teamIdMap;
};

const seedTournaments = async (createdBy, teamIdMap) => {
  for (const tournament of tournaments) {
    const date = new Date(tournament.date);
    const teamObjectIds = (tournament.teamIds || [])
      .map((teamId) => teamIdMap.get(teamId))
      .filter(Boolean);

    await Tournament.findOneAndUpdate(
      { name: tournament.name },
      {
        name: tournament.name,
        type: tournament.type,
        volleyballType: tournament.type,
        venue: tournament.venue || "",
        location: tournament.location,
        date,
        startDate: date,
        endDate: tournament.endDate ? new Date(tournament.endDate) : date,
        status: normalizeStatus(tournament.status),
        registrationStatus:
          tournament.registrationStatus || tournament.refustrationstatus || "open",
        prize: parsePrize(tournament.prize),
        image: tournament.image || "",
        maxTeams: tournament.maxTeams,
        format: tournament.format || "Single Elimination",
        skillLevel: tournament.skillLevel || "Open",
        genderCategory: tournament.genderCategory || "Mixed",
        visibility: tournament.visibility || "Public",
        bestOf: tournament.bestOf || "3 Sets",
        pointsPerSet: tournament.pointsPerSet || 25,
        finalSetPoints: tournament.finalSetPoints || 15,
        description: tournament.description || "",
        additionalRules: tournament.additionalRules || "",
        teams: teamObjectIds,
        createdBy,
      },
      {
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
        upsert: true,
      }
    );
  }
};

const run = async () => {
  await mongoose.connect(mongoURI);

  const seedUser = await getSeedUser();
  const teamIdMap = await seedTeams(seedUser._id);
  await seedTournaments(seedUser._id, teamIdMap);

  console.log(`Seeded ${teams.length} teams and ${tournaments.length} tournaments.`);
  console.log(`Seed owner: ${seedUser.email}`);
};

run()
  .catch((error) => {
    console.error("Phase 1 seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
