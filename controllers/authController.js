const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const publicRoles = ["coach", "player", "manager"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const serializeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  fullName: user.fullName || "",
  teamName: user.teamName || "",
  position: user.position || "",
  jerseyNumber:
    user.jerseyNumber === undefined || user.jerseyNumber === null
      ? ""
      : String(user.jerseyNumber),
  gender: user.gender || "",
  phone: user.phone || "",
  age: user.age === undefined || user.age === null ? "" : String(user.age),
  yearsExperience:
    user.yearsExperience === undefined || user.yearsExperience === null
      ? ""
      : String(user.yearsExperience),
  specialization: user.specialization || "",
});

// REGISTER
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const trimmedUsername = typeof username === "string" ? username.trim() : "";
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const plainPassword = typeof password === "string" ? password : "";

    if (!trimmedUsername || !normalizedEmail || !plainPassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Username, email, and password are required",
        });
    }

    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Username must be between 3 and 30 characters",
        });
    }

    if (!emailPattern.test(normalizedEmail)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please enter a valid email address",
        });
    }

    if (!passwordPattern.test(plainPassword)) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
        });
    }

    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      User.findOne({ username: new RegExp(`^${trimmedUsername}$`, "i") }),
    ]);

    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    if (existingUsername) {
      return res.status(400).json({ success: false, message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const requestedRole = typeof role === "string" ? role.trim().toLowerCase() : "";

    const user = new User({
      username: trimmedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      role: publicRoles.includes(requestedRole) ? requestedRole : "player",
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: serializeUser(user),
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({
          success: false,
          message: messages[0] || "Invalid registration data",
        });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body;

    const loginIdentifier = String(identifier || email || username || "")
      .trim()
      .toLowerCase();

    if (!loginIdentifier || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Email or username and password are required",
        });
    }

    const user = await User.findOne({
      $or: [
        { email: loginIdentifier },
        { username: new RegExp(`^${loginIdentifier}$`, "i") },
      ],
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password, new password, and confirmation are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "New passwords do not match" });
    }

    if (!passwordPattern.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
      user: serializeUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
