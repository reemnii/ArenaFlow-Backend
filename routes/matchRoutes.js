const express = require("express");
const matchController = require("../controllers/matchController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(matchController.getAll).post(protect, matchController.create);
router
  .route("/:id")
  .get(matchController.getById)
  .put(protect, matchController.update)
  .delete(protect, matchController.remove);

module.exports = router;
