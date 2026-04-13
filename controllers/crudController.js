const createCrudController = (Model, populateFields = []) => {
  const applyPopulate = (query) => {
    populateFields.forEach((field) => {
      query.populate(field);
    });

    return query;
  };

  const getAll = async (req, res, next) => {
    try {
      const items = await applyPopulate(Model.find());
      res.json(items);
    } catch (error) {
      next(error);
    }
  };

  const getById = async (req, res, next) => {
    try {
      const item = await applyPopulate(Model.findById(req.params.id));

      if (!item) {
        const error = new Error("Item not found");
        error.statusCode = 404;
        return next(error);
      }

      res.json(item);
    } catch (error) {
      next(error);
    }
  };

  const create = async (req, res, next) => {
    try {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };

  const update = async (req, res, next) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!item) {
        const error = new Error("Item not found");
        error.statusCode = 404;
        return next(error);
      }

      res.json(item);
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };

  const remove = async (req, res, next) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);

      if (!item) {
        const error = new Error("Item not found");
        error.statusCode = 404;
        return next(error);
      }

      res.json({ message: "Item deleted" });
    } catch (error) {
      next(error);
    }
  };

  return {
    getAll,
    getById,
    create,
    update,
    remove,
  };
};

module.exports = createCrudController;
