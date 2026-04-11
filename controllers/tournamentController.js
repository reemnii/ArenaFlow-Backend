const Tournament = require("../models/Tournament");
const createCrudController = require("./crudController");

module.exports = createCrudController(Tournament, ["teams", "createdBy"]);
