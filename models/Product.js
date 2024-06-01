const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: "true",
  },
  imageUrl: {
    type: String,
    required: true,
  },
  tags: [String],
  contentRef: {
    type: String,
    required: true,
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: "true",
  },
} , {timestamps : true});

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;