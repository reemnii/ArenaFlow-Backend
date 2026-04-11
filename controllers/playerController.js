const Player = require("../models/Player");
const createCrudController = require("./crudController");

module.exports = createCrudController(Player, ["team"]);
