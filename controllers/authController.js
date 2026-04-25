const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const allowedRoles = ["admin", "coach", "player", "manager"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// REGISTER
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const trimmedUsername = String(username || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!trimmedUsername || !normalizedEmail || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // check if email exists
    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      User.findOne({ username: new RegExp(`^${trimmedUsername}$`, "i") }),
    ]);

    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username: trimmedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      role: allowedRoles.includes(role) ? role : "player",
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
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
      return res.status(400).json({ message: "Email or username and password are required" });
    }

    const user = await User.findOne({
      $or: [{ email: loginIdentifier }, { username: new RegExp(`^${loginIdentifier}$`, "i") }],
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, // include role 👈
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
