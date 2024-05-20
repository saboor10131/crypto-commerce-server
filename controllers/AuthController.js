const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const register = async (req, res) => {
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
    const token = jwt.sign(
      { id: user._id, name:user.name, email:user.email, role: user.role  },
      process.env.JWT_SECRET
    );
    return res.status(200).json({ token  , name : user.name , email:user.email, role: user.role });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    let hashedPassword = user.password;
    let passwordsMatched = await bcrypt.compare(password, hashedPassword);
    if (!passwordsMatched) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, name:user.name, email:user.email, role: user.role  },
      process.env.JWT_SECRET
    );
    return res.status(200).json({ token  , name : user.name , email:user.email, role: user.role });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server error" });
  }
};

module.exports = {
  register,
  login,
};
