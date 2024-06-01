const { default: mongoose } = require("mongoose");
const Order = require("../models/Order");
const DownloadToken = require("../models/DownloadToken");
const crypto = require("crypto");
const { sendEmail } = require("../utils/mail");
require("dotenv").config();

const placeOrder = async (req, res) => {
  const { userId } = req;
  try {
    const order = new Order({
      customerId: userId,
      transactionId: "1223errw41241hqi12124",
      ...req.body,
    });
    await order.save();
    return res.status(200).json({ message: "Order saved successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Serer Error" });
  }
};
const viewOrderDetails = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }
  try {
    const orders = await Order.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $lookup: {
          from: "users",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $lookup: {
          from: "users",
          localField: "sellerId",
          foreignField: "_id",
          as: "seller",
        },
      },
      {
        $unwind: "$seller",
      },
      {
        $project: {
          "order._id": 1,
          "product.name": 1,
          "product.price": 1,
          "seller.name": 1,
          "seller.email": 1,
          "customer.name": 1,
          "customer.email": 1,
          transactionId: 1,
          createdAt: 1,
        },
      },
    ]);
    if (orders.length > 0) {
      return res.status(200).json({ data: orders[0] });
    }
    return res.status(404).json({ message: "Order not found" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Serer Error" });
  }
};

const viewOrders = async (req, res) => {
  const { userId, userRole } = req;
  const { userId: queryUserId, role: queryRole } = req.query;
  let matchStage = {};
  if (userRole == "customer") {
    matchStage.customerId = new mongoose.Types.ObjectId(userId);
  }
  if (userRole == "seller") {
    matchStage.sellerId = new mongoose.Types.ObjectId(userId);
  }
  if (userRole == "admin") {
    if (queryUserId) {
      if (queryRole == "seller") {
        matchStage.sellerId = new mongoose.Types.ObjectId(queryUserId);
      }
      if (queryRole == "customer") {
        matchStage.customerId = new mongoose.Types.ObjectId(queryUserId);
      }
    }
  }
  try {
    const orders = await Order.aggregate([
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $lookup: {
          from: "users",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $lookup: {
          from: "users",
          localField: "sellerId",
          foreignField: "_id",
          as: "seller",
        },
      },
      {
        $project: {
          "product.name": 1,
          "product.price": 1,
          "seller.name": 1,
          "customer.name": 1,
          transactionId: 1,
          createdAt: 1,
        },
      },
    ]);
    return res.status(200).json({ data: orders });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Serer Error" });
  }
};

const requestDownload = async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await Order.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "users",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $lookup: {
          from: "users",
          localField: "sellerId",
          foreignField: "_id",
          as: "seller",
        },
      },
      {
        $unwind: "$seller",
      },
      {
        $limit: 1,
      },
      {
        $project: {
          customerId: 1,
          productId: 1,
          "customer.name": 1,
          "customer.email": 1,
          "seller.name": 1,
          "seller.email": 1,
        },
      },
    ]);
    if (orders.length < 1) {
      return res.status(404).json({ message: "This order no longer exists" });
    }
    const order = orders[0];
    const { userId: senderId } = req;
    const { productId, customerId, seller, customer } = order;
    if (senderId != customerId.toString()) {
      return res
        .status(401)
        .json({ message: "You are not authorized to download this order" });
    }
    const token = crypto.randomBytes(20).toString("hex");
    const expiresAt = Date.now() + 3600000; // 1 hour from the time of request
    let downloadToken = new DownloadToken({ token, expiresAt, used: false });
    downloadToken.save();
    let html = `${process.env.APP_BASE_URL}/products/download/${productId}/${token}`;
    const response = await sendEmail(
      seller.name || "Crypto-Commerce",
      customer.name,
      customer.email,
      html
    );
    if (response.statusCode === 202) {
      return res
        .status(200)
        .json({ message: "Download link is sent via email " });
    } else throw new Error("Failed to send download link");
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  placeOrder,
  viewOrders,
  viewOrderDetails,
  requestDownload,
};
