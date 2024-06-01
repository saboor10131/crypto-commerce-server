const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    transactionId: {
      type: String,
      required: true
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel;
