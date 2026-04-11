const express = require("express");
const playerController = require("../controllers/playerController");

const router = express.Router();

router.route("/").get(playerController.getAll).post(playerController.create);
router
  .route("/:id")
  .get(playerController.getById)
  .put(playerController.update)
  .delete(playerController.remove);

module.exports = router;
