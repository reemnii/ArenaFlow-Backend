const Match = require("../models/Match");
const createCrudController = require("./crudController");

module.exports = createCrudController(Match, ["tournament", "teamA", "teamB", "winner"]);
