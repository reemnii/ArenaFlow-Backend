const express = require("express");
const matchController = require("../controllers/matchController");

const router = express.Router();

router.route("/").get(matchController.getAll).post(matchController.create);
router
  .route("/:id")
  .get(matchController.getById)
  .put(matchController.update)
  .delete(matchController.remove);

module.exports = router;
