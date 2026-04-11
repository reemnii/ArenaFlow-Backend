const createCrudController = (Model, populateFields = []) => {
  const applyPopulate = (query) => {
    populateFields.forEach((field) => {
      query.populate(field);
    });

    return query;
  };

  const getAll = async (req, res) => {
    try {
      const items = await applyPopulate(Model.find());
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const getById = async (req, res) => {
    try {
      const item = await applyPopulate(Model.findById(req.params.id));

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      res.json(item);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const create = async (req, res) => {
    try {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  const update = async (req, res) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      res.json(item);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  const remove = async (req, res) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      res.json({ message: "Item deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
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
