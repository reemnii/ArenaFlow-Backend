const express = require("express");
const scoreController = require("../controllers/scoreController");

const router = express.Router();

router.route("/").get(scoreController.getAll).post(scoreController.create);
router
  .route("/:id")
  .get(scoreController.getById)
  .put(scoreController.update)
  .delete(scoreController.remove);

module.exports = router;
