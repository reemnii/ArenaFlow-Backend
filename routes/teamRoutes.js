const express = require("express");
const teamController = require("../controllers/teamController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(teamController.getAll).post(protect, teamController.create);
router
  .route("/:id")
  .get(teamController.getById)
  .put(teamController.update)
  .delete(teamController.remove);

module.exports = router;
