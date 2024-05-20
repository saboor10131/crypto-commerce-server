const { default: mongoose } = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const getAllSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" });
    return res.status(200).json({ data: sellers });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let queryFilter = {};
    if (role) {
      queryFilter.role = role;
    }
    const customers = await User.find(queryFilter).select("-password").exec();
    return res.status(200).json({ data: customers });
  } catch (error) {
    console.log("err:" + error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password").exec();
    if (!user) {
      return res.status(404).json({ message: "Not Found" });
    }
    return res.status(200).json({ data: user });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateUser = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "UnAuthorized" });
    }
    let hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      { _id: req.userId },
      { password: hashedPassword, ...req.body }
    );
    if (user) {
      return res.status(404).json({ message: "Not Found" });
    }
    return res.status(200).json({ data: user });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getUser,
  updateUser,
  getAllSellers,
  getAllUsers,
};
