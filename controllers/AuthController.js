const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mongoose = require("mongoose");
const register = async (req, res) => {
  try {
    const { name, email, password, role , accountId } = req.body;
    if (!password){
      return res.status(400).json({ message: "Password is required" });
    }
    let hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
      accountId: role == "seller" ? accountId : ""
    });
    await user.save();
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET
    );
    return res
      .status(200)
      .json({ token, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.log(err.message);
    if (err instanceof mongoose.Error.ValidationError) {
      // Format validation errors into key-value pairs
      const errors = {};
      for (const field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({ errors });
    } else {
      return res.status(500).json({ message: "Internal Server Error"  });
    }
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
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET
    );
    return res.status(200).json({
      token,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server error" });
  }
};

module.exports = {
  register,
  login,
};
