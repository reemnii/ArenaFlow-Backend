const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.get("/me", protect, (req, res) => {
  res.json({
    message: "Protected route works",
    user: req.user,
  });
});

router.post("/register", register);
router.post("/login", login);

module.exports = router;