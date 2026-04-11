const express = require("express");
const teamController = require("../controllers/teamController");

const router = express.Router();

router.route("/").get(teamController.getAll).post(teamController.create);
router
  .route("/:id")
  .get(teamController.getById)
  .put(teamController.update)
  .delete(teamController.remove);

module.exports = router;
