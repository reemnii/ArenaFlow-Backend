const express = require("express");
const router = express.Router();
const { register, login, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { createRateLimit } = require("../middleware/rateLimit");

const authLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many authentication attempts. Please try again later.",
});

router.get("/me", protect, (req, res) => {
  res.json({
    message: "Protected route works",
    user: req.user,
  });
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/change-password", protect, authLimiter, changePassword);

module.exports = router;
