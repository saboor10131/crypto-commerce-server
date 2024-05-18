const mongoose = require("mongoose");
const Product = require("../models/Product");
const DownloadToken = require("../models/DownloadToken");
const { uploadFile , downloadFile } = require("../utils/cloudStorage");

const createProduct = async (req, res) => {
  try {
    if (!req.body.content)
      return res.status(400).json({ message: "Product File is Required" });
    let baseUrlProd = `products/${req.sellerId}`;
    const contentRef = await uploadFile(baseUrlProd, req.body.content);

    if (!req.body.image)
      return res.status(400).json({ message: "Product image is required" });
    let baseUrlImg = `images/${req.sellerId}`;
    const imageUrl = await uploadFile(baseUrlImg, req.body.image, true);

    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      categoryId: req.body.categoryId,
      imageUrl,
      tags: req.body.tags,
      contentRef,
      sellerId: req.sellerId,
    });

    await product.save();

    return res.status(201).json({ message: "Product saved successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "categories", // The name of the Category collection
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $lookup: {
          from: "users", // The name of the User collection
          localField: "sellerId",
          foreignField: "_id",
          as: "seller",
        },
      },
      {
        $unwind: "$seller",
      },
      {
        $addFields: {
          category: "$category.name",
        },
      },
      {
        $project: {
          name: 1,
          price: 1,
          description: 1,
          imageUrl: 1,
          tags: 1,
          category: 1,
          "seller.name": 1,
          "seller.email": 1,
        },
      },
    ]);
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { categoryId, sellerId, minPrice, maxPrice, searchQuery } = req.query;
    let matchStage = {};
    if (categoryId) {
      matchStage.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    if (sellerId) {
      matchStage.sellerId = new mongoose.Types.ObjectId(sellerId);
    }
    if (minPrice) {
      matchStage.price.$gte = minPrice;
    }
    if (maxPrice) {
      matchStage.price.$lte = maxPrice;
    }

    let aggregatePipline = [
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
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
        $addFields: {
          category: "$category.name",
        },
      },
      {
        $match: {
          $or: [
            { name: { $regex: searchQuery || "", $options: "i" } },
            { description: { $regex: searchQuery || "", $options: "i" } },
            { tags: { $regex: searchQuery || "", $options: "i" } },
            { category: { $regex: searchQuery || "", $options: "i" } },
          ],
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          category: 1,
          tags: 1,
          imageRef: 1,
          "seller.name": 1,
          "seller.email": 1,
        },
      },
    ];

    const products = await Product.aggregate(aggregatePipline).exec();

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const getProductById = async (req, res) => {
  try {
    let id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const products = await Product.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $lookup: {
          from: "users", // The name of the User collection
          localField: "sellerId",
          foreignField: "_id",
          as: "seller",
        },
      },
      {
        $unwind: "$seller",
      },
      {
        $addFields: {
          category: "$category.name",
        },
      },
      {
        $project: {
          name: 1,
          price: 1,
          description: 1,
          imageUrl: 1,
          tags: 1,
          category: 1,
          "seller.name": 1,
          "seller.email": 1,
        },
      },
    ]);
    if (products.length == 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ data: products[0] });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteProductById = async (req, res) => {
  try {
    let id = req.params.id;
    let sellerId = req.sellerId;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.sellerId != sellerId) {
      return res
        .status(401)
        .json({ message: "You are not authorized to delete this product" });
    }
    await Product.findByIdAndDelete(product._id);
    return res.status(204).json({ message: "product deleted successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const donwloadProduct = async (req, res) => {
  try {
    const { id, token } = req.params;
    const downloadToken = await DownloadToken.findOne({ token });
    if (
      !downloadToken ||
      downloadToken.expiresAt < Date.now() ||
      downloadToken.used
    ) {
      return res
        .status(400)
        .json({ error: "Invalid, expired, or already used token" });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "This file no longer exists" });
    }
    await downloadFile(product.contentRef , res , async () =>{
      await DownloadToken.findOneAndUpdate({token} , {used:true})
    });

  } catch (error) {
    return res.status(500).json({ error: "Internal Server" });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProductById,
  searchProducts,
  donwloadProduct,
};
