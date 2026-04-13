const express = require("express");
const tournamentController = require("../controllers/tournamentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(tournamentController.getAll).post(tournamentController.create);
router
  .route("/:id")
  .get(tournamentController.getById)
  .put(protect, tournamentController.update)
  .delete(protect, tournamentController.remove);

module.exports = router;
