const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  transactionId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["successfull", "unsuccessful"],
  },
} , {timestamps : true});

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel;
