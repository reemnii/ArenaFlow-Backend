const express = require("express");
const userController = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("admin"), userController.getAll);
router.get("/me", protect, userController.getMe);
router.put("/me", protect, userController.updateMe);

module.exports = router;
