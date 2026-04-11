const express = require("express");
const tournamentController = require("../controllers/tournamentController");

const router = express.Router();

router.route("/").get(tournamentController.getAll).post(tournamentController.create);
router
  .route("/:id")
  .get(tournamentController.getById)
  .put(tournamentController.update)
  .delete(tournamentController.remove);

module.exports = router;
