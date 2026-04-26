const express = require("express");
const scoreController = require("../controllers/scoreController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(scoreController.getAll).post(protect, scoreController.create);
router
  .route("/:id")
  .get(scoreController.getById)
  .put(protect, scoreController.update)
  .delete(protect, scoreController.remove);

module.exports = router;
