const { default: mongoose } = require("mongoose");
const User = require("../models/User");
const Order = require("../models/Order");
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
const getCustomers = async (req, res) => {
  try {
    const { sellerId } = req;
    const customers = await Order.aggregate([
      {
        $match: {
          sellerId: new mongoose.Types.ObjectId(sellerId)
        }
      },
      {
        $group: {
          _id: "$customerId",
          totalOrders: { $sum: 1 }
        }
      },
      {
        $project: {
          customerId: "$_id",
          totalOrders: 1
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "customerId",
          foreignField: "_id",
          as: "customer"
        }
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id:"$customer._id",
          name: "$customer.name",
          email : "$customer.email",
          createdAt: "$customer.createdAt",
          updatedAt: "$customer.updatedAt",
          totalOrders : "$totalOrders"
        }
      }
    ]).exec();
    return res.status(200).json({ data: customers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
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
  getCustomers,
};
