const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
    });
    await user.save();
    return res.status(201).json({message:   "Success"});
  } catch (err) {
    return res.status(500).json({message: "Server error"});
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({message:"Invalid credentials"});
  }
  let hashedPassword = user.password;
  let passwordsMatched = await bcrypt.compare(password, hashedPassword);
  if (!passwordsMatched) {
    return res.status(401).json({message:"Invalid credentials"});
  }
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );
  return res.status(200).json({ token });
};

module.exports = {
  registerUser,
  loginUser,
};