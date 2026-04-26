const User = require("../models/User");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.json({
    success: true,
    user: serializeUser(user),
  });
};

const getAll = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });

  res.json({
    success: true,
    users: users.map(serializeUser),
  });
};

const updateMe = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const {
    username,
    email,
    fullName,
    teamName,
    position,
    jerseyNumber,
    gender,
    phone,
    age,
    yearsExperience,
    specialization,
  } = req.body;

  const trimmedUsername =
    username === undefined ? user.username : String(username).trim();
  const normalizedEmail =
    email === undefined ? user.email : String(email).trim().toLowerCase();

  if (!trimmedUsername || trimmedUsername.length < 3 || trimmedUsername.length > 30) {
    return res.status(400).json({
      success: false,
      message: "Username must be between 3 and 30 characters",
    });
  }

  if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address",
    });
  }

  const [existingEmail, existingUsername] = await Promise.all([
    User.findOne({ email: normalizedEmail, _id: { $ne: user._id } }).select("_id"),
    User.findOne({
      username: new RegExp(`^${trimmedUsername}$`, "i"),
      _id: { $ne: user._id },
    }).select("_id"),
  ]);

  if (existingEmail) {
    return res.status(400).json({
      success: false,
      message: "Email already exists",
    });
  }

  if (existingUsername) {
    return res.status(400).json({
      success: false,
      message: "Username already exists",
    });
  }

  user.username = trimmedUsername;
  user.email = normalizedEmail;
  user.fullName = fullName === undefined ? user.fullName : String(fullName).trim();
  user.teamName = teamName === undefined ? user.teamName : String(teamName).trim();
  user.position = position === undefined ? user.position : String(position).trim();
  user.gender = gender === undefined ? user.gender : String(gender).trim().toLowerCase();
  user.phone = phone === undefined ? user.phone : String(phone).trim();
  user.specialization =
    specialization === undefined ? user.specialization : String(specialization).trim();

  user.jerseyNumber =
    jerseyNumber === undefined || jerseyNumber === ""
      ? undefined
      : Number(jerseyNumber);
  user.age = age === undefined || age === "" ? undefined : Number(age);
  user.yearsExperience =
    yearsExperience === undefined || yearsExperience === ""
      ? undefined
      : Number(yearsExperience);

  await user.save();

  res.json({
    success: true,
    message: "Profile updated successfully",
    user: serializeUser(user),
  });
};

module.exports = {
  getAll,
  getMe,
  updateMe,
};
