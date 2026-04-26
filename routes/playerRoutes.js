const express = require("express");
const playerController = require("../controllers/playerController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(playerController.getAll).post(protect, playerController.create);
router
  .route("/:id")
  .get(playerController.getById)
  .put(protect, playerController.update)
  .delete(protect, playerController.remove);

module.exports = router;
