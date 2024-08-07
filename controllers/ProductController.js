const mongoose = require("mongoose");
const Product = require("../models/Product");
const DownloadToken = require("../models/DownloadToken");
const FirebaseStorage = require("../utils/firebaseStorage");

const createProduct = async (req, res) => {
  try {
    let storage = new FirebaseStorage()
    if (!req.body.content)
      return res.status(400).json({ message: "Product File is Required" });
    let baseUrlProd = `products/${req.sellerId}`;
    const contentRef = await storage.uploadFile(baseUrlProd, req.body.content);

    if (!req.body.image)
      return res.status(400).json({ message: "Product image is required" });
    let baseUrlImg = `images/${req.sellerId}`;
    const imageUrl = await  storage.uploadFile(baseUrlImg, req.body.image, true);
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
    console.log(error);
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
    let { pageNumber, pageSize } = req.query;
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
    pageNumber = pageNumber - 1 || 0;
    pageSize = pageSize || 10;
    if (pageSize && pageSize > 50) {
      return res
        .status(400)
        .json({ message: "Page size should be less than 50" });
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
        $facet: {
          metadata: [{ $count: "totalCount" }],
          data: [{ $skip: pageNumber }, { $limit: pageSize }],
        },
      },
      {
        $unwind: "$metadata",
      },
      {
        $project: {
          data: {
            _id: 1,
            name: 1,
            price: 1,
            description: 1,
            category: 1,
            tags: 1,
            imageUrl: 1,
            "seller._id": 1,
            "seller.name": 1,
            "seller.email": 1,
          },
          totalCount: "$metadata.totalCount",
          next: {
            $cond: {
              if: {
                $lt: [{ $add: [pageNumber, pageSize] }, "$metadata.totalCount"],
              },
              then: { $literal: "hasNextPage" },
              else: { $literal: null },
            },
          },
        },
      },
    ];

    const products = await Product.aggregate(aggregatePipline).exec();

    return res.status(200).json(products);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const getHomeProducts = async (req, res) => {
  try {
    console.log("getting home products ...")
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "categories", 
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category._id",
          category: { $first: "$category" },
          products: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 1,
          category: 1,
          products: { $slice: ["$products", 5] },
        },
      },
    ]);

    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products grouped by category:", error);
    throw error;
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
        $project: {
          name: 1,
          price: 1,
          description: 1,
          imageUrl: 1,
          tags: 1,
          category: 1,
          "seller._id": 1,
          "seller.name": 1,
          "seller.email": 1,
          "seller.accountId": 1,
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
    console.log(id);
    let sellerId = req.sellerId;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const product = await Product.findById(id);
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
    let storage = new FirebaseStorage()
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
    await storage.downloadFile(product.contentRef, res, async () => {
      await DownloadToken.findOneAndUpdate({ token }, { used: true });
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { sellerId } = req;
    const product = await Product.findById(id);
    let imageUrl = null;
    try {
      let baseUrlProd = `images/${req.sellerId}`;
      imageUrl = await uploadFile(baseUrlProd, req.body.image, true);
    } catch (err) {
      console.log(err);
    }
    if (!product) {
      return res.status(404).json({ message: "Invalid product ID" });
    }
    if (product.sellerId != sellerId) {
      return res
        .status(401)
        .json({ message: "You are not authorized to update this product" });
    }
    const updatedProduct = await Product.findByIdAndUpdate(id, {
      name: req.body.name || product.name,
      price: req.body.price || product.price,
      description: req.body.description || product.description,
      tags: req.body.tags || product.tags,
      categoryId: req.body.categoryId || product.categoryId,
      imageUrl: imageUrl || product.imageUrl,
    });
    return res.status(200).json({ data: updatedProduct });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  deleteProductById,
  searchProducts,
  donwloadProduct,
  getHomeProducts
};
