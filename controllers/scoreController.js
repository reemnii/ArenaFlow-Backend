const Score = require("../models/Score");
const createCrudController = require("./crudController");

module.exports = createCrudController(Score, ["match", "updatedBy"]);
