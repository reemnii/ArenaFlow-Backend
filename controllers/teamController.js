const Team = require("../models/Team");
const createCrudController = require("./crudController");

const baseController = createCrudController(Team, ["createdBy"]);

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

module.exports = {
  ...baseController,
  create,
};
