const Team = require("../models/Team");
const createCrudController = require("./crudController");

module.exports = createCrudController(Team, ["createdBy"]);
